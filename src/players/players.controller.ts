import { Controller, Get, Param, Request } from '@nestjs/common';
import { PlayersService } from './players.service';

@Controller('player')
export class PlayersController {
  constructor(
    private readonly playersService: PlayersService,
  ) { }

  @Get('')
  findAll(@Request() req: any) {
    let player = req.player;
    return this.playersService.findOne(player.sub);
  }

  @Get(':username')
  findByUsername(@Param('username') username: string) {
    return this.playersService.findByUsername(username);
  }
}