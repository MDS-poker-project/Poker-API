import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from 'src/entities/player.entity';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Table } from 'src/tables/entities/table.entity';

@Injectable()
export class PlayersService {
  constructor(@InjectRepository(Player)
  private repo: Repository<Player>,
    private jwtService: JwtService
  ) { }

  async create(owner: any) {
    let user = await this.repo.findOne({ where: { username: owner.username } });
    if (user != undefined) {
      throw new BadRequestException("User already exists");
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(owner.password, salt);

    const newUser = this.repo.create({ username: owner.username, password: hashedPassword, state: "" });
    const savedUser = await this.repo.save(newUser);
    if (!savedUser) {
      throw new BadRequestException("User creation failed");
    }

    const payload = { name: newUser.username, sub: newUser.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  findAll() {
    return this.repo.find();
  }

  findByUsername(username: string) {
    return this.repo.findOne({ where: { username: username } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { "id": id } });
  }

  getActions() {
    return [
      { "name": "fold", "description": "description fold" },
      { "name": "call", "description": "description call" },
      { "name": "raise", "description": "description raise" },
    ];
  }

  async setAction(name: string, id: number) {
    const user = await this.repo.findOne({ where: { id: id } });
    if (user == undefined) {
      throw new BadRequestException("User not found");
    }
    user.state = name;
    // Supprimer la sauvegarde pour ne pas persister le state dynamique
    // this.repo.save(user);
  }

  async createAIPlayer(name: string, table: Table): Promise<Player> {
    // Créer directement une instance de Player sans passer par le repository
    const player = new Player();
    player.username = name;
    player.isAI = true;
    // Générer un ID unique
    let idExists = true;
    while (idExists) {
      const newId = Math.floor(Math.random() * 100); // Generate a random ID
      const existingPlayer = await this.repo.findOne({ where: { id: newId } });
      const existingAIPlayer = table ? table.players.find(player => player.id === newId && player.isAI) : undefined;
      if (!existingPlayer && !existingAIPlayer) {
        player.id = newId;
        idExists = false;
      }
      if (!existingPlayer) {
        player.id = newId;
        idExists = false;
      }
    }

    return player;
  }

  async createPlayer(playerId: number): Promise<Player> {
    const player = new Player();
    const playerData = await this.repo.findOne({ where: { id: playerId } });
    player.id = playerId;
    if (!playerData) {
      throw new BadRequestException("Player not found");
    }
    player.username = playerData.username;
    player.money = playerData.money;
    player.id = playerData.id;
    return player;
  }

  async motherlode(playerId: number) {
    let player = await this.repo.findOne({ where: { id: playerId } });
    if (player) {
      player.money += 1000;
      return this.repo.save(player);
    }
    return;
  }

  resetPlayer(player: Player) {
    player.hand = [];
    player.state = "";
    player.tableId = undefined;
    player.bet = 0;
    return player;
  }
}
