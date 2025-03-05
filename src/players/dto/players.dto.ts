import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Card } from 'src/tables/entities/card.entity';

export class PlayerDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    // @IsString()
    // @IsNotEmpty()
    // password: string;

    @IsNumber()
    @IsNotEmpty()
    money: number;

    @IsString()
    state: string;

    hand?: Card[];

    constructor(partial: Partial<PlayerDto>) {
        Object.assign(this, partial);
    }

}