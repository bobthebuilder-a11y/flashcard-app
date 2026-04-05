import { useState } from 'react';
import type { Flashcard } from '../types';

interface Props {
  cards: Flashcard[];
  onChange: (cards: Flashcard[]) => void;
}

export default function CardEditor({ cards, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const updateCard = (id: string, field: 'front' | 'back', value: string) => {
    onChange(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCard = (id: string) => {
    onChange(cards.filter(c => c.id !== id));
  };

  const addCard = () => {
    const newCard: Flashcard = {
      id: `${Date.now()}-new`,
      front: '',
      back: '',
    };
    onChange([...cards, newCard]);
    setEditingId(newCard.id);
  };

  return (
    <div className="space-y-2">
      {cards.map((card, i) => (
        <div
          key={card.id}
          className="bg-white border border-gray-200 rounded-xl overflow-hidden"
        >
          {editingId === card.id ? (
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 w-14 shrink-0">FRONT</span>
                <input
                  autoFocus
                  value={card.front}
                  onChange={e => updateCard(card.id, 'front', e.target.value)}
                  placeholder="Term or question"
                  className="flex-1 px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 w-14 shrink-0">BACK</span>
                <textarea
                  value={card.back}
                  onChange={e => updateCard(card.id, 'back', e.target.value)}
                  placeholder="Definition or answer"
                  rows={2}
                  className="flex-1 px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 group"
              onClick={() => setEditingId(card.id)}
            >
              <span className="text-xs text-gray-400 w-5 shrink-0 font-mono">{i + 1}</span>
              <div className="flex-1 min-w-0 px-2">
                <div className="font-medium text-sm text-gray-900 truncate">{card.front || <span className="text-gray-400 italic">Empty front</span>}</div>
                <div className="text-xs text-gray-500 truncate mt-0.5">{card.back || <span className="italic">Empty back</span>}</div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={e => { e.stopPropagation(); setEditingId(card.id); }}
                  className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                  title="Edit"
                >✏️</button>
                <button
                  onClick={e => { e.stopPropagation(); removeCard(card.id); }}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                  title="Delete"
                >🗑️</button>
              </div>
            </div>
          )}
        </div>
      ))}
      <button
        onClick={addCard}
        className="w-full py-2.5 text-sm text-blue-600 border-2 border-dashed border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        + Add card manually
      </button>
    </div>
  );
}
