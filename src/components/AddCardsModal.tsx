import { useState } from 'react';
import type { Flashcard } from '../types';
import ImageCapture from './ImageCapture';
import CardEditor from './CardEditor';
import { generateFlashcardsFromImage } from '../lib/claude';

interface Props {
  onAdd: (cards: Flashcard[]) => void;
  onClose: () => void;
}

type Step = 'capture' | 'generating' | 'review';

export default function AddCardsModal({ onAdd, onClose }: Props) {
  const [step, setStep] = useState<Step>('capture');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [streamText, setStreamText] = useState('');

  const handleImage = async (base64: string, mediaType: string) => {
    setStep('generating');
    setError(null);
    setStreamText('');
    try {
      const generated = await generateFlashcardsFromImage(base64, mediaType, (chunk) => {
        setStreamText(prev => prev + chunk);
      });
      setCards(generated);
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate flashcards');
      setStep('capture');
    }
  };

  const handleSave = () => {
    if (cards.filter(c => c.front && c.back).length === 0) return;
    onAdd(cards.filter(c => c.front && c.back));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {step === 'capture' && 'Add Cards from Photo'}
            {step === 'generating' && 'Generating Flashcards...'}
            {step === 'review' && `Review Cards (${cards.length})`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 'capture' && (
            <>
              <ImageCapture onImage={handleImage} />
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {error}
                </div>
              )}
            </>
          )}

          {step === 'generating' && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="text-4xl mb-4 animate-spin">⚙️</div>
              <p className="text-gray-600 font-medium mb-2">Claude is analyzing your image...</p>
              {streamText && (
                <div className="mt-4 w-full bg-gray-50 rounded-xl p-3 text-left text-xs font-mono text-gray-500 max-h-40 overflow-y-auto">
                  {streamText}
                </div>
              )}
            </div>
          )}

          {step === 'review' && (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Claude found {cards.length} flashcard{cards.length !== 1 ? 's' : ''}. Review and edit before saving.
              </p>
              <CardEditor cards={cards} onChange={setCards} />
            </>
          )}
        </div>

        {/* Footer */}
        {step === 'review' && (
          <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
            <button
              onClick={() => { setStep('capture'); setCards([]); }}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              Try Another
            </button>
            <button
              onClick={handleSave}
              disabled={cards.filter(c => c.front && c.back).length === 0}
              className="flex-1 py-2.5 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              Save {cards.filter(c => c.front && c.back).length} Cards
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
