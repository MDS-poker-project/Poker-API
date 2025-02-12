import { Entity, Column, PrimaryGeneratedColumn, AfterInsert } from 'typeorm';

@Entity()
export class Player {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string;

    @Column()
    password: string;

    @Column()
    state: string;

    @AfterInsert()
    after_insert() { //Se déclenche automatiquement après l'insertion
        console.log(`Owner ${this.id} created`)
    }
}
