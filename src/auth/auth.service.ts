
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PlayersService } from 'src/players/players.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private playerService: PlayersService,
    private jwtService: JwtService
  ) { }

  async signIn(player: any): Promise<{ access_token: string }> {
    const user = await this.playerService.findByUsername(player.username);
    if (user == undefined) {
      throw new BadRequestException("User not found");
    }
    if (await bcrypt.compare(player.password, user.password)) {
      const payload = { name: player.name, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } else {
      throw new UnauthorizedException("Invalid password");
    }
  }
}
