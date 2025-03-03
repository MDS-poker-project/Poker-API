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

  @Get('profil/:id')
  findOne(@Param('id') id: number) {
    return this.playersService.findOne(+id);
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