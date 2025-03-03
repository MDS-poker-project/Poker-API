import { Controller, Get, Param, Req, Request } from '@nestjs/common';
import { TablesService } from './tables.service';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) { }

  @Get()
  findAll() {
    return this.tablesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(+id);
  }

  @Get(':id/join')
  join(@Param('id') tableId: number, @Request() req: any) {
    const playerId = req.player.sub;
    return this.tablesService.join(tableId, playerId);
  }

  @Get(':id/leave')
  leave(@Param('id') tableId: number, @Request() req: any) {
    const playerId = req.player.sub;
    return this.tablesService.leave(tableId, playerId);
  }
}
