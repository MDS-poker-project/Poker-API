import { Exclude } from "class-transformer";
import { Player } from "src/entities/player.entity";
import { Deck } from "src/tables/entities/deck.entity";
import { Card } from "./card.entity";

export class Table {
    constructor(id: number) {
        this.id = id;
        this.name = "Table " + id;
        this.deck = new Deck()
        this.players = [] as Player[]
    }

    id: number

    @Exclude()
    deck: Deck;

    players: Player[];

    name: string;

    river: Card[] = [];

    pot: number = 0;

    currentBet: number = 0;

    currentTurn: number = 0;

    round: number = 0;

    dealerPosition: number = 0;
}
