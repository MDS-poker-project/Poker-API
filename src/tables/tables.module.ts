import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { PlayersService } from 'src/players/players.service';
@Module({
  controllers: [TablesController],
  providers: [TablesService, PlayersService],
  imports:[TablesModule]
})
export class TablesModule {}
