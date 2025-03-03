import { Injectable } from '@nestjs/common';
import { Table } from './entities/table.entity';
import { DeckService } from 'src/deck/deck.service';
import { PlayersService } from 'src/players/players.service';

@Injectable()
export class TablesService {
  tables: Table[] = []
  constructor(private deckService: DeckService, private playersService: PlayersService) {
    for (let i = 0; i < 5; i++) {
      this.createTable();
    }
  }

  createTable() {
    let table = new Table(this.tables.length);
    table.deck = this.deckService.shuffle(this.deckService.generateDeck());
    this.tables.push(table);
  }

  // const player =  new PlayersService()
  findAll() {
    return this.tables;
  }

  findOne(id: number) {
    return this.tables[id];
  }

  async join(tableId: number, playerId: number) {
    if (!this.tables[tableId]) {
      throw new Error(`Table ${tableId} not found`);
    }
    let player = await this.playersService.findOne(playerId);
    if (player && !this.tables[tableId].players.some(p => p.id === player.id)) {
      this.tables[tableId].players.push(player);
    }
    return this.tables[tableId];
  }

  fold(tableId: string, playerId: string) {
    return `This action folds the user ${playerId} from the table ${tableId}`;
  }

  call(tableId: string, playerId: string) {
    return `This action calls the user ${playerId} from the table ${tableId}`;
  }

  raise(tableId: string, playerId: string) {
    return `This action raises the user ${playerId} from the table ${tableId}`;
  }

  leave(tableId: string, playerId: string) {
    return `This action leaves the user ${playerId} from the table ${tableId}`;
  }

  startGame(tableId: string) {
    //Ajouter 2 IA
    //Initialiser le deck à la table
    //Distribuer les 2 cartes à chaque joueur
    //Ajouter les blinds
    return `This action starts the game on the table ${tableId}`;
  }

}