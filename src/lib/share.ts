import type { Deck, Flashcard } from '../types';

export function exportDeck(deck: Deck): void {
  const payload = {
    name: deck.name,
    cards: deck.cards.map(c => ({ front: c.front, back: c.back })),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${deck.name.replace(/[^a-z0-9]/gi, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importDeck(): Promise<Deck | null> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!Array.isArray(data.cards)) throw new Error('Invalid deck file');
        const cards: Flashcard[] = (data.cards as { front: unknown; back: unknown }[])
          .map((c, i) => ({
            id: `${Date.now()}-${i}`,
            front: String(c.front ?? '').trim(),
            back: String(c.back ?? '').trim(),
          }))
          .filter(c => c.front && c.back);
        const deck: Deck = {
          id: `deck-${Date.now()}`,
          name: String(data.name || file.name.replace(/\.json$/i, '')).trim() || 'Imported Deck',
          cards,
          createdAt: Date.now(),
        };
        resolve(deck);
      } catch {
        resolve(null);
      }
    };
    input.click();
  });
}
