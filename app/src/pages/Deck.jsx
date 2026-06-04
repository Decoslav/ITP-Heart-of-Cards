import { useEffect, useState } from 'react';
import Card from '../components/Card';
import './Deck.css';
import '../styles/shared.css';
import { getSavedDecks } from '../api/apiService';
import { PRESET_DECKS, mapCardNamesToCards, hydrateSavedCards } from '../data/cards';

function Deck() {
  const [decks, setDecks] = useState(() =>
    PRESET_DECKS.map((deck) => ({
      ...deck,
      cards: mapCardNamesToCards(deck.cards),
      source: 'preset',
    }))
  );
  const [selectedDeckId, setSelectedDeckId] = useState(PRESET_DECKS[0].id);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      const data = await getSavedDecks();
      if (data.success && data.decks.length > 0) {
        const saved = data.decks.map((d) => ({
          id: d.id,
          name: d.name,
          description: 'Dein gespeichertes Deck.',
          cards: hydrateSavedCards(d.cards),
          source: 'saved',
        }));
        setDecks([...saved, ...PRESET_DECKS.map((d) => ({
          ...d,
          cards: mapCardNamesToCards(d.cards),
          source: 'preset',
        }))]);
        setSelectedDeckId(saved[0].id);
      }
      setLoading(false);
    }

    loadSaved().catch(() => setLoading(false));
  }, []);

  const selectedDeck = decks.find((d) => d.id === selectedDeckId) ?? decks[0];
  const totalHp  = selectedDeck?.cards.reduce((s, c) => s + c.hp,  0) ?? 0;
  const totalAtk = selectedDeck?.cards.reduce((s, c) => s + c.atk, 0) ?? 0;

  return (
    <div className="deck-page page-bg">
      <section className="deck-hero">
        <p className="eyebrow">Deck-Auswahl</p>
        <h1>Wähle dein Deck</h1>
        <p>Klicke ein Deck an, um es für das nächste Duell auszuwählen.</p>
      </section>

      {loading ? (
        <p className="deck-hint">Lade Decks…</p>
      ) : (
        <>
          {/* Gespeicherte Decks */}
          {decks.some(d => d.source === 'saved') && (
            <div className="deck-group">
              <p className="eyebrow" style={{ marginBottom: '12px' }}>Meine Decks</p>
              <section className="deck-selector">
                {decks.filter(d => d.source === 'saved').map((deck) => (
                  <button
                    key={deck.id}
                    type="button"
                    className={`preset-card ${selectedDeckId === deck.id ? 'active' : ''}`}
                    onClick={() => setSelectedDeckId(deck.id)}
                  >
                    <span className="preset-label">Gespeichert</span>
                    <h2>{deck.name}</h2>
                    <p>{deck.description}</p>
                    <span className="preset-count">{deck.cards.length} Karten</span>
                  </button>
                ))}
              </section>
            </div>
          )}

          {/* Vorgefertigte Decks */}
          <div className="deck-group">
            <p className="eyebrow" style={{ marginBottom: '12px' }}>Vorgefertigte Decks</p>
            <section className="deck-selector">
              {decks.filter(d => d.source === 'preset').map((deck) => (
                <button
                  key={deck.id}
                  type="button"
                  className={`preset-card ${selectedDeckId === deck.id ? 'active' : ''}`}
                  onClick={() => setSelectedDeckId(deck.id)}
                >
                  <span className="preset-label">Vorgefertigt</span>
                  <h2>{deck.name}</h2>
                  <p>{deck.description}</p>
                  <span className="preset-count">{deck.cards.length} Karten</span>
                </button>
              ))}
            </section>
          </div>
        </>
      )}

      {selectedDeck && !loading && (
        <section className="deck-detail">
          <div className="section-top">
            <div>
              <p className="eyebrow">Ausgewählt</p>
              <h2>{selectedDeck.name}</h2>
            </div>
            <div className="deck-stats">
              <span>{selectedDeck.cards.length} Karten</span>
              <span>{totalHp} HP</span>
              <span>{totalAtk} ATK</span>
            </div>
          </div>

          <div className="deck-card-grid">
            {selectedDeck.cards.map((card, index) => (
              <Card key={`${card.name}-${index}`} {...card} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Deck;
