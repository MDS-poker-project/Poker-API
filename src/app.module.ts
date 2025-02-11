import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TablesModule } from './tables/tables.module';
import { CardsModule } from './cards/cards.module';
import { PlayersModule } from './players/players.module';

@Module({
  imports: [TablesModule, CardsModule, PlayersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
