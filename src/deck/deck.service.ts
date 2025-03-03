import { Injectable } from '@nestjs/common';
import { Deck } from 'src/tables/entities/deck.entity';

@Injectable()
export class DeckService {
    constructor() { } 

    createDeck() {
        let deck = new Deck()
        return deck;
        return 'This action creates a new deck';
    }
    shuffle(deck : Deck) {
        return 'This action shuffles the deck';
    }
    pickCard(deck : Deck) {
        return 'This action picks a card from the deck';        
    }
    burnCard(deck : Deck) {
        return 'This action burns a card from the deck';        
    }
}