import { Injectable } from '@nestjs/common';
import { Deck } from 'src/tables/entities/deck.entity';
import { Card } from 'src/tables/entities/card.entity';

@Injectable()
export class DeckService {
    constructor() {
    }

    generateDeck() {
        let suits = ['hearts', 'diamonds', 'clubs', 'spades']
        let values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
        let deck = new Deck();
        for (let suit of suits) {
            for (let value of values) {
                deck.cards.push(new Card(value, suit))
            }
        }
        return deck
    }

    shuffle(deck: Deck) {
        let currentIndex = deck.cards.length, randomIndex, temporaryValue;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = deck.cards[currentIndex];
            deck.cards[currentIndex] = deck.cards[randomIndex];
            deck.cards[randomIndex] = temporaryValue;
        }
        return deck;
    }
    pickCard(deck: Deck) {
        return 'This action picks a card from the deck';
    }
    burnCard(deck: Deck) {
        return 'This action burns a card from the deck';
    }
}