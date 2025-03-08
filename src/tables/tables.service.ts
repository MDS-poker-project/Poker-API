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
    if (!this.tables[tableId]) {
      return `Table ${tableId} not found`;
    }

    let player = await this.playersService.createPlayer(playerId);
    // let player = await this.playersService.findOne(playerId);
    if (!player) {
      return 'Player not found';
    }

    //Vérifier que le joueur a assez d'argent pour rejoindre la table
    if (player.money < 10) {
      return 'Not enough money';
    }

    //Vérifier que le joueur n'est pas déjà dans la table
    if (this.tables[tableId].players.some((p) => p.id === playerId)) {
      return `You are already in the table ${tableId}`;
    }
    this.tables[tableId].players.push(player);
    await this.startGame(tableId, playerId);
    return this.tables[tableId];
  }

  async actions(tableId: number, playerId: number, action: string, amount?: number) {
    let player = this.tables[tableId].players.find((p) => p.id === playerId);
    if (!player) {
      return `Player ${playerId} not found`;
    }
    console.log(`joueur ${player.username} action ${action} amount ${amount}`);
    if (this.tables[tableId] != null) {
      switch (action) {
        case 'fold':
          return await this.fold(tableId, playerId);
        case 'call':
          return await this.call(tableId, playerId, amount);
        case 'raise':
          return await this.raise(tableId, playerId, amount);
        case 'check':
          return await this.check(tableId, playerId);
        case 'leave':
          return this.leave(tableId, playerId);
        case 'startGame':
          return this.startGame(tableId, playerId)
        case 'small_blind':
          return this.blinds(tableId, playerId, 5);
        case 'big_blind':
          return this.blinds(tableId, playerId, 10);
        default:
          console.log('Action not found');
          return 'Action not found';
      }
    }
  }


  async blinds(tableId: number, playerId: number, amount: number) {
    // Récupérer le joueur depuis la base de données

    const player = this.tables[tableId].players.find((p) => p.id === playerId);
    if (!player) {
      return `Player ${playerId} not found`;
    }

    // Vérifier si le joueur a assez d'argent
    if (player.money < amount) {
      return 'Not enough money';
    }

    // Mettre à jour le porte-monnaie du joueur et conserver les données dynamiques en mémoire
    player.bet = amount;
    player.money = player.money - amount;
    player.state = "waiting";
    if (!player.isAI) {
      await this.playerRepository.update(playerId, { money: player.money });
      await this.playerRepository.save(player);
    }

    // Mettre à jour la mise actuelle à la table
    this.tables[tableId].currentBet = amount;
    this.tables[tableId].pot += amount;

    //Mettre à jour le player dans la table
    this.tables[tableId].players[this.tables[tableId].players.findIndex(p => p.id === playerId)] = player;

    return this.tables[tableId];
  }
  // Actiopn de passer
  fold(tableId: number, playerId: number) {
    if (!this.tables[tableId]) {
      throw new Error(`Table ${tableId} not found`);
    }

    const player = this.tables[tableId].players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found at table ${tableId}`);
    }

    player.state = 'fold';
    this.tables[tableId].players[this.tables[tableId].players.findIndex(p => p.id === playerId)] = player;
    return this.tables[tableId];
  }

  // Action de suivre la mise
  async call(tableId: number, playerId: number, amount: number = 0) {
    if (!this.tables[tableId]) {
      return `Table ${tableId} not found`;
    }

    const player = this.tables[tableId].players.find((p) => p.id === playerId);
    if (!player) {
      return `Player ${playerId} not found at table ${tableId}`;
    }

    if (player.money < amount) {
      return 'Not enough money';
    }

    // Mettre à jour le porte-monnaie
    player.money -= amount;
    player.bet = amount;
    if (!player.isAI) {
      await this.playerRepository.update(playerId, { money: player.money });
      await this.playerRepository.save(player);
    }

    this.tables[tableId].pot += amount;
    this.tables[tableId].players[this.tables[tableId].players.findIndex(p => p.id === playerId)] = player;

    return this.tables[tableId];
  }

  //  Action de relancer la mise
  async raise(tableId: number, playerId: number, amount: number = 0) {
    if (!this.tables[tableId]) {
      throw new Error(`Table ${tableId} not found`);
    }

    const player = this.tables[tableId].players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found at table ${tableId}`);
    }

    if (player.money < amount) {
      return 'Not enough money';
    }

    // Mettre à jour le porte-monnaie
    player.money -= amount;
    if (!player.isAI) {
      await this.playerRepository.update(playerId, { money: player.money });
      // await this.playerRepository.save(player);
    }
    player.bet = amount;

    return this.tables[tableId];
  }

  //  Action de checker la mise
  check(tableId: number, playerId: number) {
    if (!this.tables[tableId]) {
      throw new Error(`Table ${tableId} not found`);
    }

    const player = this.tables[tableId].players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found at table ${tableId}`);
    }

    // Dans un vrai poker, "check" ne change pas la mise actuelle, donc on ne touche pas à player.bet
    return this.tables[tableId];
  }

  // Action de quitter la table
  leave(tableId: number, playerId: number) {
    //TODO: Vérifier que la partie n'est pas en cours
    if (!this.tables[tableId]) {
      return `Table ${tableId} not found`;
    }

    const initialLength = this.tables[tableId].players.length;
    this.tables[tableId].players = this.tables[tableId].players.filter(
      (p) => p.id !== playerId,
    );
    if (this.tables[tableId].players.every((p) => p.isAI)) {
      this.tables[tableId].players = [];
    }
    this.resetTable(tableId);
    this.tables[tableId].players.forEach((player: Player) => {
      this.playersService.resetPlayer(player);
    }
    )

    return this.tables;
  }

  async startGame(tableId: number, currentPlayerId: number) {
    let table = this.tables[tableId];
    table.currentRound = 1;
    // Ajouter autant d'IA que nécessaire pour commencer la partie
    await this.generateAI(tableId, currentPlayerId, 2);

    // Désigner un joueur comme dealer
    let players = table.players;
    if (players.length > 1) {
      let dealerPosition = Math.floor(Math.random() * players.length);
      players[dealerPosition].state = "dealer";
      table.dealerIndex = dealerPosition;
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

    // Brûler une carte
    this.deckService.burnCard(table.deck);

    // Initialiser la river à la table
    for (let i = 0; i < 3; i++) {
      const card = this.deckService.pickCard(table.deck);
      if (card) {
        table.river.push(card);
      } else {
        return "No more cards in the deck";
      }
    }

    // Attribuer les blinds aux joueurs suivant le dealer par l'attribut player.state
    this.assignBlinds(tableId);

    // ----- DEBUT DU TOUR DE JEU ------
    table.currentPlayerIndex = players.findIndex(player => player.state === "small_blind");

    this.playRound(tableId);

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

    // Attribuer les rôles
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

  async generateAI(tableId: number, currentPlayerId: number, players_number: number) {
    for (let i = 0; i < players_number; i++) {
      let player = await this.playersService.createAIPlayer(`AI${i}`, this.tables[tableId]);
      const playerDTO = new PlayerDto({
        username: player.username,
        hand: player.id === currentPlayerId ? player.hand : undefined,
      });
      this.tables[tableId].players.push(player);
    }
  }

  processAIMove(tableId: number, player: Player) {
    let table = this.tables[tableId];

    // Si c'est le premier tour et que le joueur est small_blind ou big_blind, il doit jouer la blinde
    if (table.currentRound === 1 && (player.state === "small_blind" || player.state === "big_blind")) {
      let blindAmount = player.state === "small_blind" ? 5 : 10;
      this.blinds(tableId, player.id, blindAmount);
      return;
    }

    // Déterminer les actions possibles selon l'état actuel de la partie
    let possibleActions: string[] = [];

    if (player.bet < table.currentBet) {
      // Le joueur doit au moins égaliser la mise
      possibleActions = ['fold', 'call', 'raise'];
    } else {
      // Le joueur a déjà misé au niveau de la mise courante
      possibleActions = ['check', 'raise'];
    }

    // Sélection aléatoire d'une action parmi les options possibles
    let randomAction = possibleActions[Math.floor(Math.random() * possibleActions.length)];

    // Gestion spécifique de "raise" : ajout d'un montant aléatoire
    let amount = 0;
    if (randomAction === 'raise') {
      let minRaise = table.currentBet * 2; // Le minimum est souvent au moins le double de la big blind
      let maxRaise = table.currentBet * 4; // On fixe un maximum arbitraire de 4 fois la mise courante pour éviter des mises trop élevées
      amount = Math.floor(Math.random() * (maxRaise - minRaise + 1)) + minRaise; // Valeur entre minRaise et maxRaise
    }

    if (randomAction === 'call' && (amount == undefined || amount < table.currentBet - player.bet)) {
      amount = table.currentBet - player.bet;
    }

    if (player.state === "dealer") {
      table.currentRound++;
    }

    this.actions(tableId, player.id, randomAction, amount > 0 ? amount : undefined);
  }


  processHumanMove(tableId: number, playerId: number, action: string, amount?: number) {
    // Logique du joueur humain
    console.log("----------------------");
    let table = this.tables[tableId];
    console.log("Round :", table.currentRound);
    let player = table.players.find(player => player.id === playerId);

    // Vérifier que c'est bien au tour de ce joueur
    if (table.players[table.currentPlayerIndex]?.id !== playerId) {
      return "Ce n'est pas votre tour";
    }


    if (player && table.currentRound === 1 && ((player.state === "small_blind" && action !== "small_blind") || (player.state === "big_blind" && action !== "big_blind"))) {
      return "Vous devez jouer la blinde";
    }

    if (player && action === 'call' && (amount == undefined || amount < table.currentBet - player.bet)) {
      amount = table.currentBet - player.bet;
    }

    this.actions(tableId, playerId, action, amount);

    //APRES NIMPORTE QUELLE ACTION, FAIRE JOUER LES IA ET VERIFIER SI LA MANCHE EST TERMINEE
    table.currentPlayerIndex = (table.currentPlayerIndex + 1) % table.players.length;
    if (table.players[table.currentPlayerIndex]?.isAI) {
      this.playRound(tableId);
    }
    if (player?.state === "dealer") {
      table.currentRound++;
    }
    return table;
  }

  playRound(tableId: number) {
    let table = this.tables[tableId];
    while (table.players[table.currentPlayerIndex]?.isAI) {
      // TODO : L'instance de player envoyée à processAIMove n'est pas la même que table.currentPlayer
      this.processAIMove(tableId, table.players[table.currentPlayerIndex]);
      //Changer le currentPlayer
      table.currentPlayerIndex = (table.currentPlayerIndex + 1) % table.players.length;
    }
  }

}
