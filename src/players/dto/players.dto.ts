import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Player } from 'src/entities/player.entity';
import { ApiProperty } from '@nestjs/swagger';




export class PlayerDto {
    @IsString( )
    @IsNotEmpty()
    @ApiProperty()
    username: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    password: string;

    @IsNumber()
    @IsNotEmpty()

    money: number;

    @IsString()
    state: string;


}