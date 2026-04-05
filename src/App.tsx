import { useState, useEffect } from 'react';
import type { Deck, Flashcard } from './types';
import { loadDecks, saveDecks } from './lib/storage';
import ApiKeySetup from './components/ApiKeySetup';
import AddCardsModal from './components/AddCardsModal';
import QuizMode from './components/QuizMode';
import CardEditor from './components/CardEditor';

type View = 'home' | 'deck' | 'quiz';

export default function App() {
  const [decks, setDecks] = useState<Deck[]>(() => loadDecks());
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('anthropic_api_key') || '');
  const [view, setView] = useState<View>('home');
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [showNewDeckInput, setShowNewDeckInput] = useState(false);
  const [editingDeck, setEditingDeck] = useState(false);

  useEffect(() => { saveDecks(decks); }, [decks]);

  const activeDeck = decks.find(d => d.id === activeDeckId);

  const saveApiKey = (key: string) => {
    if (key) {
      localStorage.setItem('anthropic_api_key', key);
    } else {
      localStorage.removeItem('anthropic_api_key');
    }
    setApiKey(key);
  };

  const createDeck = () => {
    if (!newDeckName.trim()) return;
    const deck: Deck = {
      id: `deck-${Date.now()}`,
      name: newDeckName.trim(),
      cards: [],
      createdAt: Date.now(),
    };
    setDecks(prev => [deck, ...prev]);
    setNewDeckName('');
    setShowNewDeckInput(false);
    openDeck(deck.id);
  };

  const openDeck = (id: string) => {
    setActiveDeckId(id);
    setView('deck');
    setEditingDeck(false);
  };

  const deleteDeck = (id: string) => {
    if (!confirm('Delete this deck and all its cards?')) return;
    setDecks(prev => prev.filter(d => d.id !== id));
    if (activeDeckId === id) { setView('home'); setActiveDeckId(null); }
  };

  const addCardsToDeck = (cards: Flashcard[]) => {
    setDecks(prev => prev.map(d =>
      d.id === activeDeckId ? { ...d, cards: [...d.cards, ...cards] } : d
    ));
  };

  const updateDeckCards = (cards: Flashcard[]) => {
    setDecks(prev => prev.map(d =>
      d.id === activeDeckId ? { ...d, cards } : d
    ));
  };

  // ── Quiz view ────────────────────────────────────────────────────────────
  if (view === 'quiz' && activeDeck) {
    return (
      <div className="max-w-xl mx-auto">
        <QuizMode
          cards={activeDeck.cards}
          deckName={activeDeck.name}
          onExit={() => setView('deck')}
        />
      </div>
    );
  }

  // ── Deck view ────────────────────────────────────────────────────────────
  if (view === 'deck' && activeDeck) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <button
          onClick={() => { setView('home'); setActiveDeckId(null); }}
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
        >
          ← All Decks
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{activeDeck.name}</h1>
            <p className="text-sm text-gray-500">{activeDeck.cards.length} card{activeDeck.cards.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2">
            {activeDeck.cards.length > 0 && (
              <button
                onClick={() => setView('quiz')}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-medium"
              >
                Quiz Me
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium"
            >
              + Add Cards
            </button>
          </div>
        </div>

        {activeDeck.cards.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-4xl mb-3">📷</div>
            <p className="font-medium text-gray-500">No cards yet</p>
            <p className="text-sm mt-1">Take a photo of your textbook or notes to generate cards</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium"
            >
              Add Cards from Photo
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Cards</span>
              <button
                onClick={() => setEditingDeck(e => !e)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {editingDeck ? 'Done Editing' : 'Edit Cards'}
              </button>
            </div>
            {editingDeck ? (
              <CardEditor cards={activeDeck.cards} onChange={updateDeckCards} />
            ) : (
              <div className="space-y-2">
                {activeDeck.cards.map((card, i) => (
                  <div key={card.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex gap-3">
                    <span className="text-xs text-gray-400 font-mono w-5 shrink-0 mt-0.5">{i + 1}</span>
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-gray-900">{card.front}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{card.back}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {showAddModal && (
          <AddCardsModal
            onAdd={addCardsToDeck}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </div>
    );
  }

  // ── Home view ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🃏</div>
        <h1 className="text-3xl font-bold text-gray-900">FlashCard AI</h1>
        <p className="text-gray-500 mt-1">Turn photos into flashcards with Claude</p>
      </div>

      {!apiKey && <ApiKeySetup onSave={saveApiKey} />}

      {showNewDeckInput ? (
        <div className="flex gap-2 mb-6">
          <input
            autoFocus
            value={newDeckName}
            onChange={e => setNewDeckName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') createDeck();
              if (e.key === 'Escape') setShowNewDeckInput(false);
            }}
            placeholder="Deck name (e.g. Spanish Vocab, Chapter 5)..."
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button onClick={createDeck} disabled={!newDeckName.trim()} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
            Create
          </button>
          <button onClick={() => setShowNewDeckInput(false)} className="px-3 py-2.5 text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowNewDeckInput(true)}
          className="w-full py-3 mb-6 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 font-medium hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          + New Deck
        </button>
      )}

      {decks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p>No decks yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {decks.map(deck => (
            <div
              key={deck.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
              onClick={() => openDeck(deck.id)}
            >
              <div className="text-3xl">📚</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900">{deck.name}</div>
                <div className="text-sm text-gray-500">{deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''}</div>
              </div>
              <div className="flex items-center gap-2">
                {deck.cards.length > 0 && (
                  <button
                    onClick={e => { e.stopPropagation(); setActiveDeckId(deck.id); setView('quiz'); }}
                    className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium"
                  >
                    Quiz
                  </button>
                )}
                <button
                  onClick={e => { e.stopPropagation(); deleteDeck(deck.id); }}
                  className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 rounded transition-opacity"
                  title="Delete deck"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {apiKey && (
        <button
          onClick={() => saveApiKey('')}
          className="mt-8 text-xs text-gray-400 hover:text-gray-600 block mx-auto"
        >
          Change API Key
        </button>
      )}
    </div>
  );
}
