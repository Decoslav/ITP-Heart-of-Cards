import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import './Deckbuilder.css';
import '../styles/shared.css';
import { getSavedDecks, saveDeck } from '../api/apiService';
import { ALL_CARDS, PRESET_DECKS, mapCardNamesToCards, hydrateSavedCards } from '../data/cards';

const MAX_DECK_CARDS = 10;
const MAX_SAVED_DECKS = 3;

const CARD_SECTIONS = [
  { type: 'tank',   title: '🛡️ Tanks'  },
  { type: 'damage', title: '⚔️ Damage' },
  { type: 'hybrid', title: '⚖️ Hybrid' },
];

function getPresetById(deckId) {
  return PRESET_DECKS.find((deck) => deck.id === deckId) ?? PRESET_DECKS[0];
}

function Deckbuilder() {
  const firstPreset = getPresetById(PRESET_DECKS[0].id);

  const [selectedDeckId, setSelectedDeckId] = useState(firstPreset.id);
  const [deckName, setDeckName]             = useState(firstPreset.name);
  const [selectedCards, setSelectedCards]   = useState(() => mapCardNamesToCards(firstPreset.cards));
  const [statusMessage, setStatusMessage]   = useState('');
  const [isSaving, setIsSaving]             = useState(false);

  // Gespeicherte Decks des Users (max. 3)
  const [savedDecks, setSavedDecks]         = useState([]);
  // null = neues Deck, number = vorhandene deck_id überschreiben
  const [saveTargetId, setSaveTargetId]     = useState(null);

  const [searchTerm, setSearchTerm]               = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [sortOption, setSortOption]               = useState('name-asc');
  const [minHpFilter, setMinHpFilter]             = useState(0);
  const [minAtkFilter, setMinAtkFilter]           = useState(0);

  // ── Gespeicherte Decks laden ─────────────────────────────────────────────
  useEffect(() => {
    async function loadDecks() {
      const data = await getSavedDecks();
      if (data.success && data.decks.length > 0) {
        setSavedDecks(data.decks);
        // Standard-Speicherziel: erstes vorhandenes Deck
        setSaveTargetId(data.decks[0].id);
      }
    }
    loadDecks().catch(() => {});
  }, []);

  // ── Karten filtern & sortieren ───────────────────────────────────────────
  const filteredAndSortedCards = useMemo(() => {
    let cards = [...ALL_CARDS];

    if (searchTerm.trim())
      cards = cards.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (selectedTypeFilter !== 'all')
      cards = cards.filter(c => c.type === selectedTypeFilter);

    cards = cards.filter(c => c.hp >= minHpFilter && c.atk >= minAtkFilter);

    switch (sortOption) {
      case 'hp-desc':  cards.sort((a, b) => b.hp  - a.hp);  break;
      case 'atk-desc': cards.sort((a, b) => b.atk - a.atk); break;
      default:         cards.sort((a, b) => a.name.localeCompare(b.name));
    }

    return CARD_SECTIONS.map(s => ({ ...s, cards: cards.filter(c => c.type === s.type) }));
  }, [searchTerm, selectedTypeFilter, sortOption, minHpFilter, minAtkFilter]);

  const totalHp  = selectedCards.reduce((s, c) => s + c.hp,  0);
  const totalAtk = selectedCards.reduce((s, c) => s + c.atk, 0);

  function handleAddCard(card) {
    setSelectedCards(cur => {
      if (cur.length >= MAX_DECK_CARDS) {
        setStatusMessage('Ein Deck darf maximal 10 Karten enthalten');
        return cur;
      }
      setStatusMessage('');
      return [...cur, card];
    });
  }

  function handleRemoveCard(idx) {
    setSelectedCards(cur => cur.filter((_, i) => i !== idx));
  }

  function applyPresetDeck(deckId) {
    setSelectedDeckId(deckId);
    const preset = getPresetById(deckId);
    setDeckName(preset.name);
    setSelectedCards(mapCardNamesToCards(preset.cards));
    setStatusMessage('');
  }

  async function handleSaveDeck() {
    if (selectedCards.length === 0) { setStatusMessage('Wähle mindestens eine Karte aus'); return; }
    if (selectedCards.length > MAX_DECK_CARDS) { setStatusMessage('Ein Deck darf maximal 10 Karten haben'); return; }

    setIsSaving(true);
    setStatusMessage('');

    const data = await saveDeck(deckName, selectedCards, saveTargetId);

    if (data.success) {
      setStatusMessage('Deck gespeichert ✓');
      // Gespeicherte Decks neu laden damit die Auswahl aktuell bleibt
      const updated = await getSavedDecks();
      if (updated.success) {
        setSavedDecks(updated.decks);
        setSaveTargetId(data.deck_id);
      }
    } else {
      setStatusMessage(data.message);
    }

    setIsSaving(false);
  }

  const canCreateNew = savedDecks.length < MAX_SAVED_DECKS;

  return (
    <div className="deckbuilder-page page-bg">
      <section className="deckbuilder-hero">
        <p className="eyebrow">Deckbuilder</p>
        <h1>Wähle ein vorgefertigtes Deck</h1>
        <p>Starte direkt mit einem passenden Deck und passe es danach weiter an.</p>
      </section>

      <section className="preset-selector">
        {PRESET_DECKS.map((deck) => (
          <button
            key={deck.id}
            type="button"
            className={`preset-card ${selectedDeckId === deck.id ? 'active' : ''}`}
            onClick={() => applyPresetDeck(deck.id)}
          >
            <span className="preset-label">Vorgefertigt</span>
            <h2>{deck.name}</h2>
            <p>{deck.description}</p>
            <span className="preset-count">{deck.cards.length} Karten</span>
          </button>
        ))}
      </section>

      <section className="deck-preview">
        <div className="section-top">
          <div>
            <p className="eyebrow">Aktuell ausgewählt</p>
            <h2>{deckName}</h2>
          </div>
          <div className="deck-stats">
            <span>{selectedCards.length}/{MAX_DECK_CARDS} Karten</span>
            <span>{totalHp} HP</span>
            <span>{totalAtk} ATK</span>
          </div>

          <div className="save-controls">
            <input
              type="text"
              value={deckName}
              maxLength={50}
              onChange={e => setDeckName(e.target.value)}
              placeholder="Deckname"
            />

            <select
              value={saveTargetId ?? 'new'}
              onChange={e => setSaveTargetId(e.target.value === 'new' ? null : Number(e.target.value))}
            >
              {savedDecks.map(d => (
                <option key={d.id} value={d.id}>Überschreiben: {d.name}</option>
              ))}
              {canCreateNew && <option value="new">+ Neues Deck erstellen</option>}
              {!canCreateNew && savedDecks.length === 0 && <option value="new">+ Neues Deck erstellen</option>}
            </select>

            <button type="button" onClick={handleSaveDeck} disabled={isSaving}>
              {isSaving ? 'Speichert…' : 'Deck speichern'}
            </button>
          </div>

          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>

        <div className="deck-card-grid">
          {selectedCards.map((card, index) => (
            <Card
              key={`${card.name}-${index}`}
              {...card}
              onCardClick={() => handleRemoveCard(index)}
            />
          ))}
        </div>
      </section>

      <section className="pool-section">
        <div className="section-top">
          <div>
            <p className="eyebrow">Kartenpool</p>
            <h2>Karten mehrfach hinzufügen</h2>
          </div>
          <p className="pool-hint">Klicke eine Karte so oft du willst, maximal 10 Karten sind erlaubt.</p>
        </div>

        <div className="filter-toolbar">
          <input
            type="text"
            placeholder="Karte suchen..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />

          <select value={selectedTypeFilter} onChange={e => setSelectedTypeFilter(e.target.value)}>
            <option value="all">Alle Typen</option>
            <option value="tank">Tanks</option>
            <option value="damage">Damage</option>
            <option value="hybrid">Hybrid</option>
          </select>

          <select value={sortOption} onChange={e => setSortOption(e.target.value)}>
            <option value="name-asc">Name A-Z</option>
            <option value="hp-desc">HP absteigend</option>
            <option value="atk-desc">ATK absteigend</option>
          </select>

          <div className="number-filter">
            <label>Min HP</label>
            <input type="number" value={minHpFilter} onChange={e => setMinHpFilter(Number(e.target.value))} />
          </div>

          <div className="number-filter">
            <label>Min ATK</label>
            <input type="number" value={minAtkFilter} onChange={e => setMinAtkFilter(Number(e.target.value))} />
          </div>

          <button onClick={() => { setSearchTerm(''); setSelectedTypeFilter('all'); setSortOption('name-asc'); setMinHpFilter(0); setMinAtkFilter(0); }}>
            Filter zurücksetzen
          </button>
        </div>

        {filteredAndSortedCards.map((section) => (
          <div className="pool-group" key={section.type}>
            <h3>{section.title}</h3>
            <div className="pool-grid">
              {section.cards.map(card => (
                <Card key={card.name} {...card} onCardClick={() => handleAddCard(card)} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Deckbuilder;
