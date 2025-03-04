import { Injectable } from '@nestjs/common';
import { Table } from './entities/table.entity';
import { DeckService } from 'src/deck/deck.service';
import { PlayersService } from 'src/players/players.service';
import { retry } from 'rxjs';
import { Repository } from "typeorm";
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from 'src/entities/player.entity';
@Injectable()
export class TablesService {
  tables: Table[] = [];

  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    private deckService: DeckService,
    private playersService: PlayersService,
  ) {
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
    //Vérifier que le joueur a assez d'argent pour rejoindre la table
    if (!this.tables[tableId]) {
      throw new Error(`Table ${tableId} not found`);
    }
    let player = await this.playersService.findOne(playerId);
    if (
      player &&
      !this.tables[tableId].players.some((p) => p.id === playerId)
    ) {
      this.tables[tableId].players.push(player);
    }
    this.startGame(tableId);
    console.log(this.tables[tableId].players);
    return this.tables[tableId];
  }



  actions(tableId: number, playerId: number, action: string, amount?: number) {


    if (!this.tables[tableId] == null) {
      switch (action) {
        case 'fold':
          return this.fold(tableId, playerId);
        case 'call':
          return this.call(tableId, playerId, amount);
        case 'raise':
          return this.raise(tableId, playerId, amount);
        case 'check':
          return this.check(tableId, playerId);
        case 'leave':
          return this.leave(tableId, playerId);
        case 'startGame':
          return this.startGame(tableId)
        case 'smallBlind':
          return this.blinds(tableId, playerId, 5);
        case 'bigBlind':
          return this.blinds(tableId, playerId, 10);
        default:
          return 'Action not found';

      }
    }
  }

  async blinds(tableId: number, playerId: number, amount: number) {
    //Vérifier si le joueur a assez d'argent pour payer les blinds
    // this.playersService.canPay(amount)
    // this.playersService.pay(amount)
    let player = await this.playersService.findOne(playerId);
    if (player && player.money < amount) {
      return 'Not enough money';
    }

    //Mettre à jour le porte monnaie du joueur dans la bdd
    if (player) {
      let newMoney = player.money - amount;
      await this.playerRepository.update(playerId, { money: newMoney });
    }
    //Ajouter les mises à chaque joueur de la table
    if (player)
      player.bet = amount;


    return `This action adds the blinds to the table ${tableId}`;
  }

  fold(tableId: number, playerId: number) {
  }
  call(tableId: number, playerId: number, amount: number = 0) { }
  raise(tableId: number, playerId: number, amount: number = 0) { }
  check(tableId: number, playerId: number) { }



  leave(tableId: number, playerId: number) {
    if (!this.tables[tableId]) {
      throw new Error(`Table ${tableId} not found`);
    }
    this.tables[tableId].players = this.tables[tableId].players.filter(
      (p) => p.id !== playerId,
    );
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
function UpdatePlayerMoney(playerId: number, amount: number) {
  throw new Error('Function not implemented.');
}

