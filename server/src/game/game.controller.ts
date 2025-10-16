import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('game')
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private gameService: GameService) {}

  @Get(':id')
  async getGame(@Param('id') id: string) {
    return this.gameService.getGameState(id);
  }

  @Get('active/me')
  async getMyActiveGame(@Request() req) {
    return this.gameService.getPlayerActiveGame(req.user.id);
  }
}



