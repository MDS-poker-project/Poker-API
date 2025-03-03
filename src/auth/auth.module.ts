
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constant';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './AuthGuard';
import { PlayersModule } from 'src/players/players.module';

@Module({
  imports: [
    PlayersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '3660s' },
    }),
  ],
  providers: [AuthService,
    { provide: APP_GUARD, useClass: AuthGuard }
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule { }
