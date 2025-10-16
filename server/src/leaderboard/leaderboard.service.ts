import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard(limit: number = 100) {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        elo: true,
        totalWins: true,
        totalLoss: true,
        totalDraws: true,
        currentStreak: true,
        bestStreak: true,
        isOnline: true,
      },
      orderBy: {
        elo: 'desc',
      },
      take: limit,
    });

    // Add rank and calculate win rate
    return users.map((user, index) => {
      const totalGames = user.totalWins + user.totalLoss + user.totalDraws;
      const winRate = totalGames > 0 ? (user.totalWins / totalGames) * 100 : 0;

      return {
        ...user,
        rank: index + 1,
        totalGames,
        winRate: Math.round(winRate * 100) / 100,
      };
    });
  }

  async getPlayerStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        elo: true,
        totalWins: true,
        totalLoss: true,
        totalDraws: true,
        currentStreak: true,
        bestStreak: true,
      },
    });

    if (!user) {
      return null;
    }

    // Get player's rank
    const higherRankedCount = await this.prisma.user.count({
      where: {
        elo: {
          gt: user.elo,
        },
      },
    });

    const rank = higherRankedCount + 1;
    const totalGames = user.totalWins + user.totalLoss + user.totalDraws;
    const winRate = totalGames > 0 ? (user.totalWins / totalGames) * 100 : 0;

    // Get recent games
    const recentGames = await this.prisma.gameHistory.findMany({
      where: {
        OR: [{ player1Id: userId }, { player2Id: userId }],
      },
      include: {
        player1: {
          select: {
            id: true,
            username: true,
          },
        },
        player2: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return {
      ...user,
      rank,
      totalGames,
      winRate: Math.round(winRate * 100) / 100,
      recentGames: recentGames.map((game) => ({
        id: game.id,
        opponent: game.player1Id === userId ? game.player2 : game.player1,
        result: this.getPlayerResult(game, userId),
        eloChange:
          game.player1Id === userId
            ? game.player1EloChange
            : game.player2EloChange,
        createdAt: game.createdAt,
      })),
    };
  }

  private getPlayerResult(game: any, userId: string) {
    if (game.winnerId === userId) {
      return 'WIN';
    } else if (game.winnerId === null) {
      return 'DRAW';
    } else {
      return 'LOSS';
    }
  }

  async getTopPlayers(limit: number = 10) {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        elo: true,
        totalWins: true,
        totalLoss: true,
      },
      orderBy: {
        elo: 'desc',
      },
      take: limit,
    });
  }

  async getBestStreaks(limit: number = 10) {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        bestStreak: true,
        currentStreak: true,
      },
      orderBy: {
        bestStreak: 'desc',
      },
      take: limit,
    });
  }
}



