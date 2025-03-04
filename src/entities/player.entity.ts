import { Exclude } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { Card } from 'src/tables/entities/card.entity';
import { Entity, Column, PrimaryGeneratedColumn, AfterInsert } from 'typeorm';

@Entity()
export class Player {

    @PrimaryGeneratedColumn()
    @Exclude()
    id: number

    @Column()
    username: string;

    @Column()
    @Exclude()
    password: string = '';

    state: string = '';

    @IsNumber()
    @Column({ default: 1000 })
    money: number = 1000;

    bet: number = 0;

    hand: Card[] = [];

    tableId: number | undefined;

    isDealer: boolean = false;

    @AfterInsert()
    after_insert() { //Se déclenche automatiquement après l'insertion
        console.log(`Player ${this.id} created`)
    }

}
