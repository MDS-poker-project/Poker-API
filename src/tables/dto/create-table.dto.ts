import {  IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { Player } from 'src/entities/player.entity';
import { Deck } from '../entities/deck.entity';
import { Card } from '../entities/card.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTableDto {

    @IsNumber()
    @ApiProperty()
    ID: number;

    @IsNotEmpty()
    @ApiProperty()
    deck: Deck = new Deck();

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ default: [], isArray: true})
    players: Player[] = [];

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    name: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({default: [], isArray: true})
    river: Card[] = [];

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    pot: number = 0;
}
