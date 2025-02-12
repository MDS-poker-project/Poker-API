import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TablesModule } from './tables/tables.module';
import { PlayersModule } from './players/players.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './entities/player.entity';

@Module({
  imports: [TablesModule,
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "db.sqlite",
      entities: [Player],
      synchronize: true
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
