import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { PlayersService } from 'src/players/players.service';
import { DeckService } from 'src/deck/deck.service';
@Module({
  controllers: [TablesController],
  providers: [TablesService, DeckService, PlayersService],
  exports: [TablesService],})
export class TablesModule {}
