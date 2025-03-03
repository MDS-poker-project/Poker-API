import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PlayerDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsNumber()
    @IsNotEmpty()
    money: number;

    @IsString()
    state: string;

}