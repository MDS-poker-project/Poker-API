import { Controller, Get, Param, Post } from '@nestjs/common';
import { PlayersService } from './players.service';

@Controller()
export class PlayersController {
  constructor(
    private readonly playersService: PlayersService,
  ) { }

  @Get('')
  findAll() {
    return this.playersService.findAll();
  }

  @Get('profil/:username')
  findByUsername(@Param('username') username: string) {
    return this.playersService.findByUsername(username);
  }

  @Get('actions')
  actions() {
    return this.playersService.getActions();
  }

  @Post('actions/:name')
  setAction(@Param('name') name: string, id: number) { //Récupérer l'id du joueur
    return this.playersService.setAction(name, id);
  }
}