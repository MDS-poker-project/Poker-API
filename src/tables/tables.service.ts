import { Injectable, NotFoundException } from '@nestjs/common';
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
  MAX_ROUNDS = 4; // 0: pré-flop, 1: flop, 2: turn, 3: river

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
    table.currentRound = 0;
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
    // Vérifier qu'il n'y a pas déjà un humain à la table
    if (this.tables[tableId].players.some((p) => !p.isAI)) {
      return `Un joueur humain est déjà présent à la table ${tableId}`;
    }
    let player = await this.playersService.createPlayer(playerId);
    if (!player) {
      return 'Player not found';
    }
    if (player.money < 10) {
      return 'Not enough money';
    }
    if (this.tables[tableId].players.some((p) => p.id === playerId)) {
      return `You are already in the table ${tableId}`;
    }
    this.tables[tableId].players.push(player);
    await this.startGame(tableId, playerId);
    return this.formatResponse(tableId, playerId);
  }

  async getActions(tableId: number, playerId: number) {
    console.log("getActions", tableId, playerId);
    if (!this.tables[tableId]) {
      console.log('Table not found');
      throw new NotFoundException(`Table ${tableId} not found`);
    }
    const table = this.tables[tableId];
    return this.getPossibleActions(table, playerId);
  }

  async actions(tableId: number, playerId: number, action: string, amount?: number) {
    let player = this.tables[tableId].players.find((p) => p.id === playerId);
    console.log("playerId", playerId, "action", action, "amount", amount);
    if (!player) {
      return `Player ${playerId} not found`;
    }
    console.log(`joueur ${player.username} action ${action} amount ${amount}`);
    if (this.tables[tableId] != null) {
      switch (action) {
        case 'fold':
          return await this.fold(tableId, playerId);
        case 'call':
          return await this.call(tableId, playerId);
        case 'raise':
          return await this.raise(tableId, playerId, amount);
        case 'check':
          return await this.check(tableId, playerId);
        case 'leave':
          return this.leave(tableId, playerId);
        case 'startGame':
          return this.startGame(tableId, playerId);
        case 'small_blind':
          return this.blinds(tableId, playerId, 5);
        case 'big_blind':
          return this.blinds(tableId, playerId, 10);
        default:
          console.log('Action not found');
          return { message: 'Action not found', possibleActions: [] };
      }
    }
  }

  async blinds(tableId: number, playerId: number, amount: number) {
    const player = this.tables[tableId].players.find((p) => p.id === playerId);
    if (!player) {
      return `Player ${playerId} not found`;
    }
    if (player.money < amount) {
      return 'Not enough money';
    }
    player.bet = amount;
    player.money = player.money - amount;
    player.state = "waiting";
    if (!player.isAI && player.id) {
      await this.playerRepository.update(playerId, { money: player.money });
      await this.playerRepository.save(player);
    }
    this.tables[tableId].currentBet = amount;
    this.tables[tableId].pot += amount;
    this.tables[tableId].players[this.tables[tableId].players.findIndex(p => p.id === playerId)] = player;
    return this.formatResponse(tableId, playerId);
  }

  fold(tableId: number, playerId: number) {
    if (!this.tables[tableId]) {
      throw new NotFoundException(`Table ${tableId} not found`);
    }
    const player = this.tables[tableId].players.find((p) => p.id === playerId);
    if (!player) {
      throw new NotFoundException(`Player ${playerId} not found at table ${tableId}`);
    }
    player.state = 'fold';
    this.tables[tableId].players[this.tables[tableId].players.findIndex(p => p.id === playerId)] = player;
    let endMsg = this.checkGameEnd(tableId);
    if (endMsg) return endMsg;
    return this.formatResponse(tableId, playerId);
  }

  async call(tableId: number, playerId: number, amount: number = 0) {
    if (!this.tables[tableId]) {
      return `Table ${tableId} not found`;
    }
    const player = this.tables[tableId].players.find((p) => p.id === playerId);
    console.log("playerId", playerId, "amount", amount);
    if (!player) {
      return `Player ${playerId} not found at table ${tableId}`;
    }
    if (player.money < amount) {
      // Pour les IA : si pas assez d'argent, elles doivent se coucher automatiquement
      if (player.isAI) {
        player.state = 'fold';
        this.tables[tableId].players[this.tables[tableId].players.findIndex(p => p.id === playerId)] = player;
        let endMsg = this.checkGameEnd(tableId);
        if (endMsg) return endMsg;
        return this.formatResponse(tableId, playerId);
      }
      return 'Not enough money';
    }
    let diff = this.tables[tableId].currentBet - player.bet;
    player.money -= diff;
    player.bet = this.tables[tableId].currentBet;
    player.state = "waiting";
    if (playerId && !player.isAI) {
      await this.playerRepository.update(playerId, { money: player.money });
      await this.playerRepository.save(player);
    }
    this.tables[tableId].pot += diff;
    this.tables[tableId].players[this.tables[tableId].players.findIndex(p => p.id === playerId)] = player;
    let endMsg = this.checkGameEnd(tableId);
    if (endMsg) return endMsg;
    return this.formatResponse(tableId, playerId);
  }

  async raise(tableId: number, playerId: number, amount: number = 0) {
    if (!this.tables[tableId]) {
      throw new NotFoundException(`Table ${tableId} not found`);
    }
    const player = this.tables[tableId].players.find((p) => p.id === playerId);
    if (!player) {
      throw new NotFoundException(`Player ${playerId} not found at table ${tableId}`);
    }
    if (player.money < amount) {
      // Pour les IA : si pas assez d'argent, elles doivent se coucher automatiquement
      if (player.isAI) {
        player.state = 'fold';
        this.tables[tableId].players[this.tables[tableId].players.findIndex(p => p.id === playerId)] = player;
        let endMsg = this.checkGameEnd(tableId);
        if (endMsg) return endMsg;
        return this.formatResponse(tableId, playerId);
      }
      return 'Not enough money';
    }
    let diff = amount - player.bet;
    player.money -= diff;
    player.bet = amount;
    player.state = "waiting";
    if (!player.isAI) {
      await this.playerRepository.update(playerId, { money: player.money });
    }
    this.tables[tableId].pot += diff;
    this.tables[tableId].currentBet = amount;
    this.tables[tableId].players[this.tables[tableId].players.findIndex(p => p.id === playerId)] = player;
    let endMsg = this.checkGameEnd(tableId);
    if (endMsg) return endMsg;
    return this.formatResponse(tableId, playerId);
  }

  check(tableId: number, playerId: number) {
    if (!this.tables[tableId]) {
      throw new NotFoundException(`Table ${tableId} not found`);
    }
    const player = this.tables[tableId].players.find((p) => p.id === playerId);
    if (!player) {
      throw new NotFoundException(`Player ${playerId} not found at table ${tableId}`);
    }
    return this.formatResponse(tableId, playerId);
  }

  leave(tableId: number, playerId: number) {
    if (!this.tables[tableId]) {
      throw new NotFoundException(`Table ${tableId} not found`);
    }
    this.tables[tableId].players = this.tables[tableId].players.filter(
      (p) => p.id !== playerId,
    );
    if (this.tables[tableId].players.every((p) => p.isAI)) {
      this.tables[tableId].players = [];
    }
    this.resetTable(tableId);
    this.tables[tableId].players.forEach((player: Player) => {
      this.playersService.resetPlayer(player);
    });
    return this.tables;
  }

  async startGame(tableId: number, currentPlayerId: number) {
    let table = this.tables[tableId];
    // On garde uniquement le joueur humain déjà présent
    table.players = table.players.filter(p => !p.isAI);
    table.currentRound = 0;
    await this.generateAI(tableId, currentPlayerId, 2);
    let players = table.players;
    if (players.length > 1) {
      let dealerPosition = Math.floor(Math.random() * players.length);
      players[dealerPosition].state = "dealer";
      table.dealerIndex = dealerPosition;
    }
    players.forEach(player => {
      for (let i = 0; i < 2; i++) {
        const card = this.deckService.pickCard(table.deck);
        if (card) {
          player.hand?.push(card);
        } else {
          return "No more cards in the deck";
        }
      }
    });
    this.assignBlinds(tableId);
    table.currentPlayerIndex = players.findIndex(player => player.state === "small_blind");
    // On démarre le round de mises en pré-flop
    this.playRound(tableId);
  }

  assignBlinds(tableId: number) {
    let table = this.tables[tableId];
    if (!table) return;
    let players = table.players;
    let dealerIndex = players.findIndex(player => player.state === "dealer");
    if (dealerIndex === -1) return;
    let smallBlindIndex = (dealerIndex + 1) % players.length;
    let bigBlindIndex = (dealerIndex + 2) % players.length;
    players.forEach(player => player.state = "waiting");
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
    this.tables[tableId].currentRound = 0;
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

  checkGameEnd(tableId: number): string | undefined {
    let table = this.tables[tableId];
    let activePlayers = table.players.filter(p => p.state !== "fold");
    if (activePlayers.length === 1) {
      const potWon = table.pot;
      const winner = activePlayers[0];
      const victoryMsg = `Everyone folded, player ${winner.username} wins ${potWon}`;
      // On réinitialise la table après avoir sauvegardé le message
      this.resetTable(tableId);
      return victoryMsg;
    }
    return undefined;
  }

  async processAIMove(tableId: number, player: Player): Promise<string | { table: Table, possibleActions: string[] }> {
    let table = this.tables[tableId];
    let isDealer = this.tables[tableId].dealerIndex === table.players.findIndex(p => p.id === player.id);

    if (player.state === "fold") {
      if (isDealer) {
        // Passage au round suivant si le dealer a terminé son tour
        const next = this.nextRound(tableId);
        if (typeof next === 'string') return next;
      }
      return this.formatResponse(tableId, player.id);
    }

    if (this.tables[tableId].players.every((p) => p.state === "fold" || p.id === player.id)) {
      const potWon = this.tables[tableId].pot;
      this.resetTable(tableId);
      return `Everyone folded, player ${player.id} wins ${potWon}`;
    }

    if (table.currentRound === 0 && (player.state === "small_blind" || player.state === "big_blind")) {
      await this.blinds(tableId, player.id, player.state === "small_blind" ? 5 : 10);
      return this.formatResponse(tableId, player.id);
    }

    let possibleActions: string[] = (player.bet < table.currentBet)
      ? ['fold', 'call', 'raise']
      : ['check', 'raise'];
    let randomAction = possibleActions[Math.floor(Math.random() * possibleActions.length)];
    let raiseAmount = 0;
    if (randomAction === 'raise') {
      let minRaise = table.currentBet * 2;
      let maxRaise = table.currentBet * 4 || player.money;
      raiseAmount = Math.floor(Math.random() * (maxRaise - minRaise + 1)) + minRaise;
    }

    const actionResult = await this.actions(tableId, player.id, randomAction, randomAction === 'raise' ? raiseAmount : undefined);
    if (typeof actionResult === 'string') return actionResult; // Message de fin ou erreur

    const endMsg = this.checkGameEnd(tableId);
    if (endMsg) return endMsg;

    if (isDealer) {
      const next = this.nextRound(tableId);
      if (typeof next === 'string') return next;
    }
    return this.formatResponse(tableId, player.id);
  }

  async processHumanMove(tableId: number, playerId: number, action: string, amount?: number): Promise<string | { table: Table, possibleActions: string[] }> {
    let table = this.tables[tableId];
    let player = table.players.find(p => p.id === playerId);
    let isDealer = this.tables[tableId].dealerIndex === table.players.findIndex(p => p.id === playerId);
    if (!player) return `Player ${playerId} not found`;
    if (table.players[table.currentPlayerIndex]?.id !== playerId) {
      return "Ce n'est pas votre tour";
    }
    if (table.currentRound === 0 && ((player.state === "small_blind" && action !== "small_blind") || (player.state === "big_blind" && action !== "big_blind"))) {
      return `Vous devez jouer la ${player.state === "small_blind" ? "petite" : "grande"} blinde`;
    }
    if (action === "check" && player.bet < table.currentBet) {
      return "Vous ne pouvez pas checker, vous devez au moins suivre";
    }
    if (action === "raise") {
      if (amount === undefined) {
        return "Vous devez spécifier un montant";
      }
      if (amount < table.currentBet * 2) {
        return "Vous devez au moins doubler la mise actuelle\n (mise actuelle : " + table.currentBet + ")";
      }
      if (player.money < amount) {
        return "Vous n'avez pas assez d'argent\n (votre argent : " + player.money + ")";
      }
    }

    const actionResult = await this.actions(tableId, playerId, action, amount);
    if (typeof actionResult === 'string') return actionResult; // Message de fin ou d'erreur

    const endMsg = this.checkGameEnd(tableId);
    if (endMsg) return endMsg;
    table.currentPlayerIndex = (table.currentPlayerIndex + 1) % table.players.length;
    if (table.players[table.currentPlayerIndex]?.isAI) {
      return await this.playRound(tableId);
    }
    if (isDealer) {
      const next = this.nextRound(tableId);
      if (typeof next === 'string') return next;
    }
    return this.formatResponse(tableId, playerId);
  }

  async playRound(tableId: number): Promise<string | { table: Table; possibleActions: string[] }> {
    let table = this.tables[tableId];
    while (table.players[table.currentPlayerIndex]?.isAI) {
      const result = await this.processAIMove(tableId, table.players[table.currentPlayerIndex]);
      if (typeof result === 'string') {
        return result;
      }
      table.currentPlayerIndex = (table.currentPlayerIndex + 1) % table.players.length;
    }
    return this.formatResponse(tableId, table.players[table.currentPlayerIndex].id);
  }

  private nextRound(tableId: number): string | void {
    let table = this.tables[tableId];
    if (table.currentRound === 0) {
      // Passage du pré-flop au flop : distribution de 3 cartes
      table.currentRound++;
      this.deckService.burnCard(table.deck);
      for (let i = 0; i < 3; i++) {
        const card = this.deckService.pickCard(table.deck);
        if (card) {
          table.river.push(card);
        } else {
          return "No more cards in the deck";
        }
      }
    } else if (table.currentRound === 1 || table.currentRound === 2) {
      // Turn et River : distribution d'une seule carte
      table.currentRound++;
      this.deckService.burnCard(table.deck);
      const card = this.deckService.pickCard(table.deck);
      if (card) {
        table.river.push(card);
      } else {
        return "No more cards in the deck";
      }
    } else {
      return this.finishGame(tableId);
    }
  }

  finishGame(tableId: number): string {
    let table = this.tables[tableId];
    const msg = "Game finished. Showdown not implemented.";
    this.resetTable(tableId);
    return msg;
  }

  private getPossibleActions(table: Table, playerId: number): string[] {
    const player = table.players.find(p => p.id === playerId);
    if (!player) return [];

    const possibleActions: string[] = [];

    if (player.state === "fold") {
      return []; // Aucune action possible s'il s'est couché
    }

    if (table.currentRound === 0 && (player.state === "small_blind" || player.state === "big_blind")) {
      possibleActions.push(player.state);
      return possibleActions;
    }

    if (player.bet < table.currentBet && player.money >= (table.currentBet - player.bet)) {
      possibleActions.push("call");
    }

    if (player.bet === table.currentBet) {
      possibleActions.push("check");
    }

    if (player.money > (table.currentBet - player.bet)) {
      possibleActions.push("raise");
    }

    possibleActions.push("fold");

    possibleActions.push("leave");

    return possibleActions;
  }

  private formatResponse(tableId: number, playerId: number): { table: Table, possibleActions: string[] } {
    const table = this.tables[tableId];
    return {
      table: table,
      possibleActions: this.getPossibleActions(table, playerId),
    };
  }


}
