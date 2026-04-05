export interface Flashcard {
  id: string;
  front: string; // term
  back: string;  // definition
}

export interface Deck {
  id: string;
  name: string;
  cards: Flashcard[];
  createdAt: number;
}
