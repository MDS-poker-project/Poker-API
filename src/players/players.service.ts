import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from 'src/entities/player.entity';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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

  async setAction(name: string, id: number) { //Récupérer l'id du joueur quand jwt
    const user = await this.repo.findOne({ where: { id: id } });
    if (user == undefined) {
      throw new BadRequestException("User not found");
    }
    user.state = name;
    this.repo.save(user);
  }

  createPlayer(name: string): Player {
    // Créer directement une instance de Player sans passer par le repository
    const player = new Player();
    player.username = name;
    player.isAI = true;
    return player;
  }

  async motherlode(playerId: number) {
    let player = await this.repo.findOne({ where: { id: playerId } });
    if (player) {
      player.money += 100;
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
