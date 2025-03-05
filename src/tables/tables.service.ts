import { Injectable } from '@nestjs/common';
import { Table } from './entities/table.entity';
import { DeckService } from 'src/deck/deck.service';
import { PlayersService } from 'src/players/players.service';
import { PlayerDto } from 'src/players/dto/players.dto';
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
      return `Table ${tableId} not found`;
    }
    //Vérifier que le joueur n'est pas déjà dans la table
    if (this.tables[tableId].players.some((p) => p.id === playerId)) {
      return `You are already in the table ${tableId}`;
    }
    let player = await this.playersService.findOne(playerId);
    if (!player) {
      return 'Player not found';
    }
    this.tables[tableId].players.push(player);
    this.startGame(tableId, playerId);
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
          return this.startGame(tableId, playerId)
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
    //TODO: Vérifier que la partie n'est pas en cours
    if (!this.tables[tableId]) {
      return `Table ${tableId} not found`;
    }
    this.tables[tableId].players = this.tables[tableId].players.filter(
      (p) => p.id !== playerId,
    );
    if (this.tables[tableId].players.every((p) => p.isAI)) {
      this.tables[tableId].players = [];
    }
    if (this.tables[tableId].players.length === 0) {
      this.resetTable(tableId);
      this.tables[tableId].players.forEach((player: Player) => {
        this.playersService.resetPlayer(player);
      }
      )
    }
    return this.tables;
  }

  startGame(tableId: number, currentPlayerId: number) {
    let table = this.tables[tableId];
    table.currentRound = 1;
    // Ajouter autant d'IA que nécessaire pour commencer la partie
    this.generateAI(tableId, currentPlayerId, 3);

    // Désigner un joueur (AI) comme dealer
    let AIPlayers = table.players.filter(player => player.isAI === true);
    if (AIPlayers.length > 1) {
      let dealerPosition = Math.floor(Math.random() * AIPlayers.length);
      AIPlayers[dealerPosition].state = "dealer";
    }

    // Initialiser la river à la table
    for (let i = 0; i < 3; i++) {
      const card = this.deckService.pickCard(table.deck);
      if (card) {
        table.river.push(card);
      } else {
        return "No more cards in the deck";
      }
    }

    // Distribuer les 2 cartes à chaque joueur
    table.players.forEach(player => {
      for (let i = 0; i < 2; i++) {
        const card = this.deckService.pickCard(table.deck);
        if (card) {
          player.hand.push(card);
        } else {
          return "No more cards in the deck";
        }
      }
    });
    // Attribuer les blinds aux joueurs suivant le dealer par l'attribut player.state
    this.assignBlinds(tableId);

    // DEBUT DU TOUR DE JEU
    let roundActive = true;
    let players = table.players;
    table.currentPlayer = players.find(player => player.state === "small_blind");

    while (roundActive && table.currentRound <= 4) {
      console.log(`Round ${table.currentRound}`);
      console.log(`Current player: ${table.currentPlayer?.username}`);

      if (table.currentPlayer) {
        table.currentPlayer.isAI ?
          this.processAIMove(tableId, table.currentPlayer) :
          this.processHumanMove(tableId, table.currentPlayer);
      }
      table.currentRound++;

    }

  }

  assignBlinds(tableId: number) {
    let table = this.tables[tableId];
    if (!table) return;

    let players = table.players;
    let dealerIndex = players.findIndex(player => player.state === "dealer");

    if (dealerIndex === -1) return; // Aucun dealer trouvé

    // Calculer les positions des blinds en tenant compte du cycle
    let smallBlindIndex = (dealerIndex + 1) % players.length;
    let bigBlindIndex = (dealerIndex + 2) % players.length;

    // Réinitialiser les états des joueurs
    players.forEach(player => player.state = "waiting");

    // Attribuer les blinds
    players[dealerIndex].state = "dealer";
    players[smallBlindIndex].state = "small_blind";
    players[bigBlindIndex].state = "big_blind";
  }


  UpdatePlayerMoney(playerId: number, amount: number) {
    throw new Error('Function not implemented.');
  }

  resetTable(tableId: number) {
    this.tables[tableId].players = [];
    this.tables[tableId].deck = this.deckService.shuffle(this.deckService.generateDeck());
    this.tables[tableId].river = [];
    this.tables[tableId].pot = 0;
    this.tables[tableId].currentBet = 0;
    // this.tables[tableId].currentPlayer = 0;
  }

  generateAI(tableId: number, currentPlayerId: number, players_number: number) {
    let currentPlayersCount = this.tables[tableId].players.length;
    let IA_needed = players_number - currentPlayersCount;

    for (let i = 0; i < IA_needed; i++) {
      let player = this.playersService.createPlayer(`AI${i}`);
      const playerDTO = new PlayerDto({
        username: player.username,
        hand: player.id === currentPlayerId ? player.hand : undefined,
      });
      this.tables[tableId].players.push(player);
    }
  }

  processAIMove(tableId: number, player: Player) {
    // Logique de l'IA
    console.log(`AI ${player.username} is playing`);

    let table = this.tables[tableId];

    // Si c'est le premier tour et que le joueur est small_blind ou big_blind, il doit jouer la blinde
    if (table.currentRound === 1 && (player.state === "small_blind" || player.state === "big_blind")) {
      let blindAmount = player.state === "small_blind" ? 5 : 10;
      console.log(`AI ${player.username} is paying the ${player.state} of ${blindAmount}`);
      console.log(player)
      this.blinds(tableId, player.id, blindAmount);
    } else {
      // Sinon, on simule une action aléatoire
      let actions = ['fold', 'call', 'raise', 'check'];
      let randomAction = actions[Math.floor(Math.random() * actions.length)];
      console.log(`AI ${player.username} is ${randomAction}ing`);
      this.actions(tableId, player.id, randomAction);
    }
  }

  processHumanMove(tableId: number, player: Player) {
    // Logique du joueur humain
    console.log(`Player ${player.username} is playing`);
  }

}
