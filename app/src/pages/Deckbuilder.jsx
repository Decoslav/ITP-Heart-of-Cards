import { useMemo, useState } from 'react';
import Card from '../components/Card';
import './Deckbuilder.css';

const ALL_CARDS = [
  //Tanks
  { name: 'Knight', hp: 50, atk: 5, imageUrl: '/images/Knight.png', type: 'tank' },
  { name: 'Ice-Golem', hp: 60, atk: 2, imageUrl: '/images/IceGolem.png', type: 'tank' },
  { name: 'Sea-Guardian', hp: 40, atk: 6, imageUrl: '/images/SeaGuardian.png', type: 'tank' },
  { name: 'Ender-Dragon', hp: 50, atk: 5, imageUrl: '/images/EnderDragon.png', type: 'tank' },
  //Damage
  { name: 'Bone-Warrior', hp: 10, atk: 20, imageUrl: '/images/BoneWarrior.png', type: 'damage' },
  { name: 'Ice-Mage', hp: 15, atk: 20, imageUrl: '/images/IceMage.png', type: 'damage' },
  { name: 'Goblin', hp: 15, atk: 10, imageUrl: '/images/Goblin.png', type: 'damage' },
  { name: 'Shadow-Ninja', hp: 12, atk: 18, imageUrl: '/images/ShadowNinja.png', type: 'damage' },
  { name: 'Summoner', hp: 15, atk: 15, imageUrl: '/images/Summoner.png', type: 'damage' },
  //Hybrid
  { name: 'Fire-Dragon', hp: 25, atk: 8, imageUrl: '/images/FireDragon.png', type: 'hybrid' },
  { name: 'Ice-Witch', hp: 20, atk: 5, imageUrl: '/images/IceWitch.png', type: 'hybrid' },
  { name: 'Gnome', hp: 30, atk: 4, imageUrl: '/images/Gnome.png', type: 'hybrid' },
  { name: 'Thunderbird', hp: 22, atk: 12, imageUrl: '/images/ThunderBird.png', type: 'hybrid' },
  { name: 'Phoenix', hp: 20, atk: 12, imageUrl: '/images/Phoenix.png', type: 'hybrid' },
  { name: 'Bowser', hp: 35, atk: 10, imageUrl: '/images/Bowser.png', type: 'hybrid' },
];

const PRESET_DECKS = [
  {
    id: 'firestorm',
    name: 'Feuersturm',
    description: 'Schnell, aggressiv und auf hohen Schaden ausgelegt.',
    cards: ['Fire-Dragon', 'Phoenix', 'Bone-Warrior', 'Goblin', 'Summoner', 'Shadow-Ninja', 'Bowser', 'Ice-Mage'],
  },
  {
    id: 'frostguard',
    name: 'Frostwache',
    description: 'Viel Leben, stabile Frontline und sichere Kontrolle.',
    cards: ['Knight', 'Ice-Golem', 'Sea-Guardian', 'Ice-Witch', 'Ice-Mage', 'Gnome', 'Thunderbird', 'Summoner'],
  },
  {
    id: 'shadow',
    name: 'Schattenpakt',
    description: 'Flexibel, mystisch und mit starken Hybrid-Karten.',
    cards: ['Ender-Dragon', 'Shadow-Ninja', 'Summoner', 'Ice-Witch', 'Fire-Dragon', 'Bowser', 'Phoenix', 'Gnome'],
  },
];

const CARD_SECTIONS = [
  { type: 'tank', title: '🛡️ Tanks' },
  { type: 'damage', title: '⚔️ Damage' },
  { type: 'hybrid', title: '⚖️ Hybrid' },
];

function getPresetById(deckId) {
  return PRESET_DECKS.find((deck) => deck.id === deckId) ?? PRESET_DECKS[0];
}

function mapCardNamesToCards(cardNames) {
  return cardNames
    .map((cardName) => ALL_CARDS.find((card) => card.name === cardName))
    .filter(Boolean);
}

function Deckbuilder() {
  const [selectedDeckId, setSelectedDeckId] = useState(PRESET_DECKS[0].id);
  const [selectedCards, setSelectedCards] = useState([]);

  const selectedDeck = useMemo(() => {
    const preset = getPresetById(selectedDeckId);

    return {
      ...preset,
      cards: mapCardNamesToCards(preset.cards),
    };
  }, [selectedDeckId]);

  const cardsByType = useMemo(() => {
    return CARD_SECTIONS.map((section) => ({
      ...section,
      cards: ALL_CARDS.filter((card) => card.type === section.type),
    }));
  }, []);

  const visibleDeckCards = selectedCards.length > 0 ? selectedCards : selectedDeck.cards;

  const totalHp = visibleDeckCards.reduce((sum, card) => sum + card.hp, 0);
  const totalAtk = visibleDeckCards.reduce((sum, card) => sum + card.atk, 0);

  function handleAddCard(card) {
    setSelectedCards((currentCards) => [...currentCards, card]);
  }

  function handleRemoveCard(indexToRemove) {
    setSelectedCards((currentCards) => currentCards.filter((_, index) => index !== indexToRemove));
  }

  function applyPresetDeck(deckId) {
    setSelectedDeckId(deckId);

    const preset = getPresetById(deckId);
    const presetCards = mapCardNamesToCards(preset.cards);

    setSelectedCards(presetCards);
  }

  return (
    <div className="deckbuilder-page">
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
            <h2>{selectedDeck.name}</h2>
          </div>
          <div className="deck-stats">
            <span>{visibleDeckCards.length} Karten</span>
            <span>{totalHp} HP</span>
            <span>{totalAtk} ATK</span>
          </div>
        </div>

        <div className="deck-card-grid">
          {visibleDeckCards.map((card, index) => (
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
          <p className="pool-hint">Klicke eine Karte so oft du willst, um mehrere Kopien ins Deck zu legen.</p>
        </div>

        {cardsByType.map((section) => (
          <div className="pool-group" key={section.type}>
            <h3>{section.title}</h3>
            <div className="pool-grid">
              {section.cards.map((card) => (
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