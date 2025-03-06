import { Controller, Get, Param, Request } from '@nestjs/common';
import { PlayersService } from './players.service';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiResponse({
  status: 201,
  description: 'The record has been successfully created.',
})
@ApiResponse({ status: 403, description: 'Forbidden.' })
@Controller('player')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get('')
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(@Request() req: any) {
    let player = req.player;
    return this.playersService.findOne(player.sub);
  }

  @Get('motherlode')
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  motherlode(@Request() req: any) {
    let player = req.player;
    return this.playersService.motherlode(player.sub);
  }

  @Get(':username')
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByUsername(@Param('username') username: string) {
    return this.playersService.findByUsername(username);
  }
}
