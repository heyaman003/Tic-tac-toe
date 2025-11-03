import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async createGame(player1Id: string, player2Id: string) {
    return await this.prisma.game.create({
      data: {
        player1Id,
        player2Id,
        currentTurn: player1Id, // Player 1 (X) starts
        board: '         ', // 9 empty spaces
      },
      include: {
        player1: true,
        player2: true,
      },
    });
  }

  async makeMove(gameId: string, userId: string, position: number) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        player1: true,
        player2: true,
      },
    });

    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    if (game.status !== 'IN_PROGRESS') {
      return { success: false, error: 'Game is not in progress' };
    }

    // Check if it's the player's turn
    if (game.currentTurn !== userId) {
      return { success: false, error: 'Not your turn' };
    }

    // Check move timeout
    const moveTimeLimit = game.moveTimeLimit * 1000; // Convert to milliseconds
    const timeSinceLastMove = Date.now() - game.lastMoveAt.getTime();

    if (timeSinceLastMove > moveTimeLimit) {
      // Time's up, other player wins
      const winnerId =
        game.player1Id === userId ? game.player2Id : game.player1Id;
      await this.endGame(gameId, winnerId, 'timeout');
      return {
        success: false,
        error: 'Time limit exceeded',
        gameEnded: true,
        winnerId,
      };
    }

    // Validate position
    if (position < 0 || position > 8) {
      return { success: false, error: 'Invalid position' };
    }

    const board = game.board.split('');

    if (board[position] !== ' ') {
      return { success: false, error: 'Position already taken' };
    }

    // Determine player symbol
    const symbol = game.player1Id === userId ? 'X' : 'O';
    board[position] = symbol;

    const newBoard = board.join('');

    // Check for winner
    const winner = this.checkWinner(newBoard);

    if (winner) {
      const winnerId = winner === 'X' ? game.player1Id : game.player2Id;
      await this.endGame(gameId, winnerId, 'win');

      return {
        success: true,
        board: newBoard,
        winner: winnerId,
        result: 'win',
      };
    }

    // Check for draw
    if (!newBoard.includes(' ')) {
      await this.endGame(gameId, null, 'draw');

      return {
        success: true,
        board: newBoard,
        result: 'draw',
      };
    }

    // Update game state
    const nextTurn =
      game.player1Id === userId ? game.player2Id : game.player1Id;

    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        board: newBoard,
        currentTurn: nextTurn,
        lastMoveAt: new Date(),
      },
    });

    return {
      success: true,
      board: newBoard,
      nextTurn,
    };
  }

  private checkWinner(board: string): string | null {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] !== ' ' && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return null;
  }

  private async endGame(
    gameId: string,
    winnerId: string | null,
    reason: string,
  ) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        player1: true,
        player2: true,
      },
    });

    if (!game) return;

    // Determine game result
    let result: 'PLAYER1_WIN' | 'PLAYER2_WIN' | 'DRAW' | 'ABANDONED';

    if (!winnerId) {
      result = 'DRAW';
    } else if (winnerId === game.player1Id) {
      result = 'PLAYER1_WIN';
    } else {
      result = 'PLAYER2_WIN';
    }

    if (reason === 'disconnect' || reason === 'timeout') {
      result = 'ABANDONED';
    }

    // Calculate ELO changes
    const { player1Change, player2Change } = this.calculateEloChanges(
      game.player1.elo,
      game.player2.elo,
      result,
    );

    // Calculate game duration
    const duration = Math.floor((Date.now() - game.createdAt.getTime()) / 1000);

    // Count moves
    const movesCount = game.board
      .split('')
      .filter((cell) => cell !== ' ').length;

    // Update game status
    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'COMPLETED',
        winnerId,
      },
    });

    // Create game history
    await this.prisma.gameHistory.create({
      data: {
        player1Id: game.player1Id,
        player2Id: game.player2Id,
        winnerId,
        result,
        finalBoard: game.board,
        movesCount,
        duration,
        player1EloChange: player1Change,
        player2EloChange: player2Change,
      },
    });

    // Update player stats
    await this.updatePlayerStats(
      game.player1Id,
      game.player1.elo,
      player1Change,
      result === 'PLAYER1_WIN',
      result === 'PLAYER2_WIN',
      result === 'DRAW',
    );

    await this.updatePlayerStats(
      game.player2Id,
      game.player2.elo,
      player2Change,
      result === 'PLAYER2_WIN',
      result === 'PLAYER1_WIN',
      result === 'DRAW',
    );
  }

  private calculateEloChanges(
    player1Elo: number,
    player2Elo: number,
    result: 'PLAYER1_WIN' | 'PLAYER2_WIN' | 'DRAW' | 'ABANDONED',
  ): { player1Change: number; player2Change: number } {
    const K = 32; // K-factor for ELO calculation

    // Expected scores
    const expectedPlayer1 =
      1 / (1 + Math.pow(10, (player2Elo - player1Elo) / 400));
    const expectedPlayer2 =
      1 / (1 + Math.pow(10, (player1Elo - player2Elo) / 400));

    // Actual scores
    let actualPlayer1 = 0.5; // Draw
    let actualPlayer2 = 0.5;

    if (result === 'PLAYER1_WIN') {
      actualPlayer1 = 1;
      actualPlayer2 = 0;
    } else if (result === 'PLAYER2_WIN') {
      actualPlayer1 = 0;
      actualPlayer2 = 1;
    } else if (result === 'ABANDONED') {
      // No ELO change for abandoned games
      return { player1Change: 0, player2Change: 0 };
    }

    // Calculate changes
    const player1Change = Math.round(K * (actualPlayer1 - expectedPlayer1));
    const player2Change = Math.round(K * (actualPlayer2 - expectedPlayer2));

    return { player1Change, player2Change };
  }

  private async updatePlayerStats(
    playerId: string,
    currentElo: number,
    eloChange: number,
    won: boolean,
    lost: boolean,
    draw: boolean,
  ) {
    const player = await this.prisma.user.findUnique({
      where: { id: playerId },
    });

    if (!player) return;

    let newStreak = player.currentStreak;

    if (won) {
      newStreak = player.currentStreak > 0 ? player.currentStreak + 1 : 1;
    } else if (lost) {
      newStreak = player.currentStreak < 0 ? player.currentStreak - 1 : -1;
    } else {
      newStreak = 0; // Draw resets streak
    }

    const bestStreak = Math.max(player.bestStreak, Math.abs(newStreak));

    await this.prisma.user.update({
      where: { id: playerId },
      data: {
        elo: currentElo + eloChange,
        totalWins: won ? player.totalWins + 1 : player.totalWins,
        totalLoss: lost ? player.totalLoss + 1 : player.totalLoss,
        totalDraws: draw ? player.totalDraws + 1 : player.totalDraws,
        currentStreak: newStreak,
        bestStreak,
      },
    });
  }

  async handlePlayerDisconnect(gameId: string, userId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game || game.status !== 'IN_PROGRESS') {
      return;
    }

    // The other player wins
    const winnerId =
      game.player1Id === userId ? game.player2Id : game.player1Id;
    await this.endGame(gameId, winnerId, 'disconnect');
  }

  async getGameState(gameId: string) {
    return await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        player1: {
          select: {
            id: true,
            username: true,
            elo: true,
          },
        },
        player2: {
          select: {
            id: true,
            username: true,
            elo: true,
          },
        },
      },
    });
  }

  async getPlayerActiveGame(userId: string) {
    return await this.prisma.game.findFirst({
      where: {
        AND: [
          {
            OR: [{ player1Id: userId }, { player2Id: userId }],
          },
          { status: 'IN_PROGRESS' },
        ],
      },
      include: {
        player1: true,
        player2: true,
      },
    });
  }
}




