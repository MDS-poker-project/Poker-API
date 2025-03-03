import { Card } from './card.entity';


export class Deck {
  cards : Card[] = []
  constructor(
     
  ) {
    this. createDeck()
  }

  public shuffle() {
    // Shuffle the deck
  }

  public draw() {
    // Draw a card
  }

  private createDeck() {
    // Create a deck
    this.cards.push(new Card('A', 'Spades'))
  }


}