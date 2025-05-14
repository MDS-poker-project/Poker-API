import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

import { AuthGuard } from './AuthGuard';
import { AuthService } from './auth.service';
import { Public } from 'src/decorators/public.decorator';
import { PlayersService } from 'src/players/players.service';
import { PlayerDto } from 'src/players/dto/players.dto';
import { Player } from 'src/entities/player.entity';
import { ApiBearerAuth } from '@nestjs/swagger';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private playerService: PlayersService) { }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signIn')
  async signIn(@Body() player: PlayerDto) {
    return this.authService.signIn(player);
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('signUp')
  async signUp(@Body() player: Player) {
    return this.playerService.create(player);
  }


  @Get('profile')
  @ApiBearerAuth()
  getProfile(@Request() req: any) {
    return this.playerService.findOne(req.player.userId);
  }
}
