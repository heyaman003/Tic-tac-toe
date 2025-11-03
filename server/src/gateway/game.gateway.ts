import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { GameService } from '../game/game.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private prisma: PrismaService,
    private gameService: GameService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // Find user by socketId and mark as offline
    const user = await this.prisma.user.findFirst({
      where: { socketId: client.id },
    });

    if (user) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isOnline: false, socketId: null },
      });

      // Check if user has any active games
      const activeGames = await this.prisma.game.findMany({
        where: {
          AND: [
            {
              OR: [{ player1Id: user.id }, { player2Id: user.id }],
            },
            { status: 'IN_PROGRESS' },
          ],
        },
        include: {
          player1: true,
          player2: true,
        },
      });

      // Handle disconnect for active games
      for (const game of activeGames) {
        await this.gameService.handlePlayerDisconnect(game.id, user.id);

        // Notify the other player
        const opponentId =
          game.player1Id === user.id ? game.player2Id : game.player1Id;
        const opponent = await this.prisma.user.findUnique({
          where: { id: opponentId },
        });

        if (opponent?.socketId) {
          this.server.to(opponent.socketId).emit('opponentDisconnected', {
            gameId: game.id,
            message: `${user.username} disconnected. You win!`,
          });
        }
      }

      // Broadcast updated user list
      this.broadcastOnlineUsers();
    }
  }

  @SubscribeMessage('authenticate')
  async handleAuthenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    try {
      const user = await this.prisma.user.update({
        where: { id: data.userId },
        data: {
          isOnline: true,
          socketId: client.id,
        },
      });

      // Send user their data
      client.emit('authenticated', {
        userId: user.id,
        username: user.username,
      });

      // Broadcast updated user list
      this.broadcastOnlineUsers();

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Authentication failed' };
    }
  }

  @SubscribeMessage('getOnlineUsers')
  async handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
    const users = await this.prisma.user.findMany({
      where: { isOnline: true },
      select: {
        id: true,
        username: true,
        elo: true,
        totalWins: true,
        totalLoss: true,
        isOnline: true,
      },
    });

    client.emit('onlineUsers', users);
  }

  @SubscribeMessage('sendInvite')
  async handleSendInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: string; receiverId: string },
  ) {
    try {
      // Check if receiver is online and not in a game
      const receiver = await this.prisma.user.findUnique({
        where: { id: data.receiverId },
      });

      if (!receiver || !receiver.isOnline) {
        client.emit('inviteError', { message: 'User is not online' });
        return;
      }

      // Check if receiver already has an active game
      const activeGame = await this.prisma.game.findFirst({
        where: {
          AND: [
            {
              OR: [
                { player1Id: data.receiverId },
                { player2Id: data.receiverId },
              ],
            },
            { status: 'IN_PROGRESS' },
          ],
        },
      });

      if (activeGame) {
        client.emit('inviteError', { message: 'User is already in a game' });
        return;
      }

      // Create invite
      const invite = await this.prisma.gameInvite.create({
        data: {
          senderId: data.senderId,
          receiverId: data.receiverId,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              elo: true,
            },
          },
        },
      });

      // Send invite to receiver
      if (receiver.socketId) {
        this.server.to(receiver.socketId).emit('inviteReceived', {
          inviteId: invite.id,
          sender: invite.sender,
        });
      }

      client.emit('inviteSent', { inviteId: invite.id });
    } catch (error) {
      client.emit('inviteError', { message: 'Failed to send invite' });
    }
  }

  @SubscribeMessage('acceptInvite')
  async handleAcceptInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { inviteId: string },
  ) {
    try {
      const invite = await this.prisma.gameInvite.findUnique({
        where: { id: data.inviteId },
        include: {
          sender: true,
          receiver: true,
        },
      });

      if (!invite || invite.status !== 'PENDING') {
        client.emit('inviteError', { message: 'Invalid invite' });
        return;
      }

      // Update invite status
      await this.prisma.gameInvite.update({
        where: { id: data.inviteId },
        data: { status: 'ACCEPTED' },
      });

      // Create game
      const game = await this.gameService.createGame(
        invite.senderId,
        invite.receiverId,
      );

      // Notify both players
      if (invite.sender.socketId) {
        this.server.to(invite.sender.socketId).emit('gameStarted', {
          gameId: game.id,
          opponent: {
            id: invite.receiver.id,
            username: invite.receiver.username,
          },
          isPlayerX: true,
        });
      }

      if (invite.receiver.socketId) {
        this.server.to(invite.receiver.socketId).emit('gameStarted', {
          gameId: game.id,
          opponent: {
            id: invite.sender.id,
            username: invite.sender.username,
          },
          isPlayerX: false,
        });
      }
    } catch (error) {
      client.emit('inviteError', { message: 'Failed to accept invite' });
    }
  }

  @SubscribeMessage('rejectInvite')
  async handleRejectInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { inviteId: string },
  ) {
    try {
      const invite = await this.prisma.gameInvite.findUnique({
        where: { id: data.inviteId },
        include: { sender: true },
      });

      if (!invite) {
        return;
      }

      await this.prisma.gameInvite.update({
        where: { id: data.inviteId },
        data: { status: 'REJECTED' },
      });

      // Notify sender
      if (invite.sender.socketId) {
        this.server.to(invite.sender.socketId).emit('inviteRejected', {
          inviteId: invite.id,
        });
      }
    } catch (error) {
      console.error('Failed to reject invite:', error);
    }
  }

  @SubscribeMessage('makeMove')
  async handleMakeMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; position: number; userId: string },
  ) {
    try {
      const result = await this.gameService.makeMove(
        data.gameId,
        data.userId,
        data.position,
      );

      if (!result.success) {
        client.emit('moveError', { message: result.error });
        return;
      }

      // Notify both players of the move
      const game = await this.prisma.game.findUnique({
        where: { id: data.gameId },
        include: {
          player1: true,
          player2: true,
        },
      });

      if (game) {
        const gameState = {
          gameId: game.id,
          board: game.board.split(''),
          currentTurn: game.currentTurn,
          status: game.status,
          winnerId: game.winnerId,
          lastMoveAt: game.lastMoveAt,
        };

        if (game.player1.socketId) {
          this.server.to(game.player1.socketId).emit('gameUpdate', gameState);
        }
        if (game.player2.socketId) {
          this.server.to(game.player2.socketId).emit('gameUpdate', gameState);
        }

        // If game is completed, notify about game end
        if (game.status === 'COMPLETED') {
          const endData = {
            gameId: game.id,
            winnerId: game.winnerId,
            result: result.result,
          };

          if (game.player1.socketId) {
            this.server.to(game.player1.socketId).emit('gameEnded', endData);
          }
          if (game.player2.socketId) {
            this.server.to(game.player2.socketId).emit('gameEnded', endData);
          }
        }
      }
    } catch (error) {
      client.emit('moveError', { message: 'Failed to make move' });
    }
  }

  private async broadcastOnlineUsers() {
    const users = await this.prisma.user.findMany({
      where: { isOnline: true },
      select: {
        id: true,
        username: true,
        elo: true,
        totalWins: true,
        totalLoss: true,
        isOnline: true,
      },
    });

    this.server.emit('onlineUsers', users);
  }
}




