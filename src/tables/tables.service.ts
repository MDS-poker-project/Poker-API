import { Injectable } from '@nestjs/common';
import { Table } from './entities/table.entity';
import { PlayersService } from 'src/players/players.service';
import { DeckService } from 'src/deck/deck.service';

@Injectable()
export class TablesService {
  tables : Table[] = []
  constructor(private deckService : DeckService) {
    }

  createTable() { 
    let table = new Table('Table ' + this.tables.length)
    this.tables.push(table)
    return table;
  }



  

    // const player =  new PlayersService()
  findAll() {
    return `This action returns all tables`;
  }

  findOne(id: number) {
    return `This action returns a #${id} table`;
  }

  join(tableId: string, playerId: string) {

    return `This action joins the user ${playerId} to the table ${tableId}`;
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