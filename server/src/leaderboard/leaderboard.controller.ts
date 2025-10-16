import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.leaderboardService.getLeaderboard(limitNum);
  }

  @Get('player/:id')
  async getPlayerStats(@Param('id') id: string) {
    return this.leaderboardService.getPlayerStats(id);
  }

  @Get('top')
  async getTopPlayers(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.leaderboardService.getTopPlayers(limitNum);
  }

  @Get('streaks')
  async getBestStreaks(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.leaderboardService.getBestStreaks(limitNum);
  }
}



