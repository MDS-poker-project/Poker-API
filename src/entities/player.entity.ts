import { Entity, Column, PrimaryGeneratedColumn, AfterInsert } from 'typeorm';

@Entity()
export class Player {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    username: string;

    @Column()
    password: string;

    @Column({ nullable: false })
    state: string;

    @AfterInsert()
    after_insert() { //Se déclenche automatiquement après l'insertion
        console.log(`Player ${this.id} created`)
    }
}
