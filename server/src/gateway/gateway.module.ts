import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GameGateway } from './game.gateway';
import { GameModule } from '../game/game.module';

@Module({
  imports: [
    GameModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get('JWT_SECRET') ||
          'your-super-secret-jwt-key-change-this-in-production',
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION') || '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [GameGateway],
  exports: [GameGateway],
})
export class GatewayModule {}



