import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from 'src/entities/player.entity';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class PlayersService {
  [x: string]: any;
  constructor(@InjectRepository(Player)
  private repo: Repository<Player>) { }

  async create(owner: any) {
    let user = await this.repo.findOne({ where: { name: owner.name } });
    if (user != undefined) {
      throw new BadRequestException("User already exists");
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(owner.password, salt);

    const newUser = this.repo.create({ name: owner.name, password: hashedPassword });
    this.repo.save(newUser);
  }

  async login(owner: any) {
    let user = await this.repo.findOne({ where: { name: owner.name } });
    if (user == undefined) {
      throw new BadRequestException("User not found");
    }
    if (await bcrypt.compare(owner.password, owner.password)) {
      return user;
    } else {
      throw new BadRequestException("Invalid password");
    }
  }

  findAll() {
    return this.repo.find();
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
}
