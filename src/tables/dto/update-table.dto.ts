import { PartialType } from '@nestjs/mapped-types';
import { CreateTableDto } from './create-table.dto';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { Deck } from '../entities/deck.entity';
import { Player } from 'src/entities/player.entity';
import { Card } from '../entities/card.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTableDto extends PartialType(CreateTableDto) {

    @ApiProperty()
    @IsNotEmpty()
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

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    pot: number = 0;
   
}
