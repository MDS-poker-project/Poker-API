import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { PlayersService } from 'src/players/players.service';
import { Deck } from 'src/commons/deck.model';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService,
                private playersService: PlayersService[],
                private nbPlayers: number,
                private state: string,
                private deck: Deck,
    ) {}

  @Get()
  findAll() {
    return this.tablesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(+id);
  }


  @Get(':id/join')
  join(@Param('id') tableId: string) {
    return this.tablesService.join(tableId, playerId);
  }
}
