/**
 * Fisher-Yates shuffle algorithm.
 * Returns a new shuffled array. Original is not modified.
 * Each card also gets a random isReversed flag.
 */
export function shuffleDeck(cards) {
  const deck = cards.map((card) => ({
    ...card,
    isReversed: Math.random() < 0.5,
  }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/**
 * Draw N cards from the top of a shuffled deck.
 */
export function drawCards(deck, count) {
  return deck.slice(0, count);
}
