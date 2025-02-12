import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TablesModule } from './tables/tables.module';

import { PlayersModule } from './players/players.module';
import { TablesService } from './tables/tables.service';

@Module({
  imports: [TablesModule, PlayersModule],
  controllers: [AppController],
  providers: [AppService, TablesService],
})
export class AppModule {}
