import { Controller, Get, Param } from '@nestjs/common';
import { TablesService } from './tables.service';
import { PlayersService } from 'src/players/players.service';


@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  findAll() {
    return this.tablesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(+id);
  }


  @Get(':id/join')
  join(@Param('id') tableId: string, playerId: string) {
    return this.tablesService.join(tableId, playerId);

  }
}
