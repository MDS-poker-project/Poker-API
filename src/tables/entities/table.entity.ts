import { Deck } from "src/entities/deck.entity";

export class Table {
    deck : Deck
    players : string[]

    constructor()   {
        this.deck = new Deck()
        this.players = []
    }
}
