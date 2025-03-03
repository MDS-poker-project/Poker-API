import { Deck } from "src/tables/entities/deck.entity";

export class Table {
    deck: Deck
    players: string[]
    name:string
    constructor(name: string)   {
        this.name = name;
        this.deck = new Deck()
        this.players = []
    }
}
