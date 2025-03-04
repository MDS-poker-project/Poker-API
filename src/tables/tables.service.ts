import { Injectable } from '@nestjs/common';
import { Table } from './entities/table.entity';
import { DeckService } from 'src/deck/deck.service';
import { PlayersService } from 'src/players/players.service';

@Injectable()
export class TablesService {
  tables: Table[] = []
  constructor(private deckService: DeckService, private playersService: PlayersService) {
    for (let i = 0; i < 4; i++) {
      this.createTable();
    }
  }

  createTable() {
    let table = new Table(this.tables.length);
    table.deck = this.deckService.shuffle(this.deckService.generateDeck());
    this.tables.push(table);
  }

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
    this.startGame(tableId);
    console.log(this.tables[tableId].players);
    return this.tables[tableId];
  }

  fold(tableId: number, playerId: number) {
    return `This action folds the user ${playerId} from the table ${tableId}`;
  }

  call(tableId: number, playerId: number) {
    return `This action calls the user ${playerId} from the table ${tableId}`;
  }

  raise(tableId: number, playerId: number) {
    return `This action raises the user ${playerId} from the table ${tableId}`;
  }

  leave(tableId: number, playerId: number) {
    if (!this.tables[tableId]) {
      throw new Error(`Table ${tableId} not found`);
    }
    this.tables[tableId].players = this.tables[tableId].players.filter(p => p.id !== playerId);
    return this.tables[tableId];
  }

  startGame(tableId: number) {
    //Ajouter autant d'IA que nécessaire pour commencer la partie
    let players_number = 3;
    let currentPlayersCount = this.tables[tableId].players.length;
    let IA_needed = players_number - currentPlayersCount;

    for (let i = 0; i < IA_needed; i++) {
      let player = this.playersService.createPlayer(`IA${i}`);
      this.tables[tableId].players.push(player);
    }

    //Initialiser la river à la table
    for (let i = 0; i < 3; i++) {
      const card = this.deckService.pickCard(this.tables[tableId].deck);
      if (card) {
        this.tables[tableId].river.push(card);
      } else {
        throw new Error('No more cards in the deck');
      }
    }
    //Distribuer les 2 cartes à chaque joueur
    //Ajouter les blinds
    return `This action starts the game on the table ${tableId}`;
  }

}