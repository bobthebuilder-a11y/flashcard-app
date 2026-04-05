import { useState, useCallback } from 'react';
import type { Flashcard } from '../types';

interface Props {
  cards: Flashcard[];
  deckName: string;
  onExit: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizMode({ cards, deckName, onExit }: Props) {
  const [queue, setQueue] = useState<Flashcard[]>(() => shuffle(cards));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(false);

  const current = queue[index];

  const answer = useCallback((isCorrect: boolean) => {
    setTotal(t => t + 1);
    if (isCorrect) setCorrect(c => c + 1);
    if (index + 1 >= queue.length) {
      setDone(true);
    } else {
      setIndex(i => i + 1);
      setFlipped(false);
    }
  }, [index, queue.length]);

  const restart = () => {
    setQueue(shuffle(cards));
    setIndex(0);
    setFlipped(false);
    setCorrect(0);
    setTotal(0);
    setDone(false);
  };

  if (done) {
    const pct = Math.round((correct / total) * 100);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-6xl mb-4">
          {pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📚'}
        </div>
        <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
        <p className="text-gray-600 mb-1">You got <span className="font-bold text-blue-600">{correct}/{total}</span> correct</p>
        <div className="w-full max-w-xs bg-gray-200 rounded-full h-3 my-4">
          <div
            className={`h-3 rounded-full transition-all ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-3xl font-bold mb-6">{pct}%</p>
        <div className="flex gap-3">
          <button onClick={restart} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
            Try Again
          </button>
          <button onClick={onExit} className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium">
            Back to Deck
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 py-6 min-h-[60vh]">
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-6">
        <button onClick={onExit} className="text-sm text-gray-500 hover:text-gray-700">
          ← Exit
        </button>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-700">{deckName}</div>
          <div className="text-xs text-gray-400">{index + 1} / {queue.length}</div>
        </div>
        <div className="text-sm text-green-600 font-medium">{correct}/{total}</div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-lg bg-gray-200 rounded-full h-1.5 mb-8">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all"
          style={{ width: `${((index) / queue.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div
        className="w-full max-w-lg cursor-pointer select-none"
        onClick={() => setFlipped(f => !f)}
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '240px',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white border-2 border-blue-200 rounded-2xl shadow-lg flex flex-col items-center justify-center p-8"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-4">Term</div>
            <div className="text-2xl font-bold text-gray-900 text-center">{current.front}</div>
            <div className="text-xs text-gray-400 mt-6">Tap to reveal answer</div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-blue-600 border-2 border-blue-600 rounded-2xl shadow-lg flex flex-col items-center justify-center p-8"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-4">Definition</div>
            <div className="text-xl font-medium text-white text-center leading-relaxed">{current.back}</div>
          </div>
        </div>
      </div>

      {/* Answer buttons */}
      {flipped && (
        <div className="flex gap-4 mt-8 w-full max-w-lg">
          <button
            onClick={() => answer(false)}
            className="flex-1 py-3 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-colors text-sm"
          >
            ✗ Still learning
          </button>
          <button
            onClick={() => answer(true)}
            className="flex-1 py-3 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl font-medium hover:bg-green-100 transition-colors text-sm"
          >
            ✓ Got it!
          </button>
        </div>
      )}

      {!flipped && (
        <p className="mt-6 text-sm text-gray-400">Tap the card to flip it</p>
      )}
    </div>
  );
}
