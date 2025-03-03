import { Exclude } from "class-transformer";
import { Player } from "src/entities/player.entity";
import { Deck } from "src/tables/entities/deck.entity";

export class Table {
    id: number

    @Exclude()
    deck: Deck
    players: Player[]
    name: string
    constructor(id: number) {
        this.id = id;
        this.name = "Table " + id;
        this.deck = new Deck()
        this.players = [] as Player[]
    }
}
