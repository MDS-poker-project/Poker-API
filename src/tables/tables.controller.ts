import { Body, Controller, Get, Param, Post, Req, Request } from '@nestjs/common';
import { TablesService } from './tables.service';
import { FilterPlayerHandInterceptor } from 'src/player-interceptor/player-interceptor.interceptor';
import { UseInterceptors } from '@nestjs/common';
import { ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('tables')
@UseInterceptors(FilterPlayerHandInterceptor)
@ApiResponse({ status: 201, description: 'The record has been successfully created.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
export class TablesController {
  constructor(private readonly tablesService: TablesService) { }

  @Get('')
  @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll() {
    return this.tablesService.findAll();
  }

  @Get(':id')
  @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(+id);
  }

  @Get(':id/join')
  @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  join(@Param('id') tableId: number, @Request() req: any) {
    const playerId = req.player.sub;
    return this.tablesService.join(tableId, playerId);
  }


  @Get(':id/leave')
  @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  leave(@Param('id') tableId: number, @Request() req: any) {
    const playerId = req.player.sub;
    return this.tablesService.leave(tableId, playerId);
  }

  @Get(':id/actions/:action')
  @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  act(@Param('id') tableId: number, @Param('action') action: string, @Request() req: any) {
    console.log("AAA")
    const playerId = req.player.sub;
    return this.tablesService.actions(tableId, playerId, action);
  }

}
