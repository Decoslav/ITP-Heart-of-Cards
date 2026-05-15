import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import './Deckbuilder.css';
import { getSavedDeck, saveDeck } from '../api/apiService';

const MAX_DECK_CARDS = 10;

const ALL_CARDS = [

  // TANKS
  { name: "Knight", hp: 60, atk: 4, imageUrl: "/images/Knight.png", type: "tank", description: "A knight with a lionheart."},
  { name: "Ice-Golem", hp: 50, atk: 4, imageUrl: "/images/IceGolem.png", type: "tank", description: "This golem was born in the first ice age."},
  { name: "Sea-Guardian", hp: 40, atk: 6, imageUrl: "/images/SeaGuardian.png", type: "tank", description: "The guardian of Atlantis."},
  { name: "Ender-Dragon", hp: 50, atk: 5, imageUrl: "/images/EnderDragon.png", type: "tank", description: "Ender of all dragons."},
  { name: "King Slime", hp: 64, atk: 2, imageUrl: "/images/king_slime.png", type: "tank", description: "It ate enough material to become the king of all slimes."},
  { name: "Stronghold", hp: 45, atk: 5, imageUrl: "/images/stronghold.png", type: "tank", description: "Created by a mad alchemist, it protects the kingdom from all enemies."},
  { name: "Djinn", hp: 50, atk: 5, imageUrl: "/images/djinn.png", type: "tank", description: "Three wishes are granted for freeing the djinn from his prison."},

  // DAMAGE
  { name: "Bone-Warrior", hp: 10, atk: 20, imageUrl: "/images/BoneWarrior.png", type: "damage", description: "He forgot to die and keeps fighting."},
  { name: "Ice-Mage", hp: 8, atk: 22, imageUrl: "/images/IceMage.png", type: "damage", description: "Absolute zero not only in theory."},
  { name: "Goblin", hp: 20, atk: 10, imageUrl: "/images/Goblin.png", type: "damage", description: "An anomaly of the goblin kin, they don't read."},
  { name: "Shadow-Ninja", hp: 12, atk: 18, imageUrl: "/images/ShadowNinja.png", type: "damage", description: "Mid gap."},
  { name: "Summoner", hp: 15, atk: 15, imageUrl: "/images/Summoner.png", type: "damage", description: "Never alone."},
  { name: "Sultan", hp: 14, atk: 16, imageUrl: "/images/sultan.png", type: "damage", description: "He spins to win his fights."},

  // HYBRID
  { name: "Fire-Dragon", hp: 25, atk: 8, imageUrl: "/images/FireDragon.png", type: "hybrid", description: "A dragon that burns all his enemies."},
  { name: "Ice-Witch", hp: 20, atk: 5, imageUrl: "/images/IceWitch.png", type: "hybrid", description: "Ice cold spells and an ice cold heart."},
  { name: "Gnome", hp: 30, atk: 4, imageUrl: "/images/Gnome.png", type: "hybrid", description: "After 1000 years he learned to control lightning."},
  { name: "Thunderbird", hp: 22, atk: 12, imageUrl: "/images/ThunderBird.png", type: "hybrid", description: "In the east they call her 'Taifun', in the west 'Hurricane' and in the south 'Cyclone'."},
  { name: "Phoenix", hp: 20, atk: 12, imageUrl: "/images/Phoenix.png", type: "hybrid", description: "Phoenix never dies."},
  { name: "Bowser", hp: 30, atk: 7, imageUrl: "/images/Bowser.png", type: "hybrid", description: "His name is 'Cupcake' and he doesn't bite."},
  { name: "Dragon Monk", hp: 24, atk: 10, imageUrl: "/images/dragon_monk.png", type: "hybrid", description: "After training Kung Fu everyday he mastered the dragon fist."},

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

//gespeicherte karten bekommen wieder ihre lokal gespeicherten bilder
function hydrateSavedCards(cardsFromApi){
  return cardsFromApi
      .map((apiCard)=>{
        const localCard = ALL_CARDS.find((card) => card.name === apiCard.name);

        return localCard ??{
          name: apiCard.name,
          hp: apiCard.hp,
          atk: apiCard. atk,
          imageUrl: "",
          type : "saved",
          description: "Gespeicherte Karte."
        };
      })
      .filter(Boolean);
}

function Deckbuilder() {

  const firstPreset = getPresetById(PRESET_DECKS[0].id);
  const [selectedDeckId, setSelectedDeckId] = useState(firstPreset.id);
  const [deckName, setDeckName] = useState(firstPreset.name);
  const [selectedCards, setSelectedCards] = useState(() => mapCardNamesToCards(firstPreset.cards));
  const [statutsMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);


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

  const visibleDeckCards = selectedCards;

  const totalHp = visibleDeckCards.reduce((sum, card) => sum + card.hp, 0);
  const totalAtk = visibleDeckCards.reduce((sum, card) => sum + card.atk, 0);

  useEffect(() => {
    async function loadSavedDeck() {
      const data = await getSavedDeck();

      if(data.success && data.deck){
        setDeckName(data.deck.name);
        setSelectedCards(hydrateSavedCards(data.deck.cards));
        setStatusMessage("Gespeichertes Deck löschen");
      }else if(!data.success){
        setStatusMessage(data.message);
      }
    }

    loadSavedDeck();
  }, []);

  function handleAddCard(card) {
    setSelectedCards((currentCards) => {
        if(currentCards.length >= MAX_DECK_CARDS){
          setStatusMessage("Ein Deck darf maximal 10 Karten enthalten");
          return currentCards;
        }

        setStatusMessage("");
        return [...currentCards, card];
    });
  }

  function handleRemoveCard(indexToRemove) {
    setSelectedCards((currentCards) => currentCards.filter((_, index) => index !== indexToRemove));
  }

  function applyPresetDeck(deckId) {
    setSelectedDeckId(deckId);

    const preset = getPresetById(deckId);
    const presetCards = mapCardNamesToCards(preset.cards);

    setDeckName(preset.name);
    setSelectedCards(presetCards);
    setStatusMessage("");
  }

  async function handleSaveDeck() {
    
    if(selectedCards.length === 0){
      setStatusMessage("Wähle mindestens eine Karte aus");
      return;
    }

    if(selectedCards.length > MAX_DECK_CARDS){
      setStatusMessage("Ein Deck darf maximal 10 Karten haben");
      return;
    }

    setIsSaving(true);
    setStatusMessage("");

    const data= await saveDeck(deckName, selectedCards);

    if(data.success){
      setStatusMessage("Deck wurde gespeichert");
    }else{
      setStatusMessage("data.message");
    }

    setIsSaving(false);
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
            <h2>{deckName}</h2>
          </div>
          <div className="deck-stats">
            <span>{visibleDeckCards.length}/{MAX_DECK_CARDS} Karten</span>
            <span>{totalHp} HP</span>
            <span>{totalAtk} ATK</span>
          </div>
          
          <div>
            <input type='text' value={deckName} maxLength={50} onChange={(event) => setDeckName(event.target.value)}placeholder='Deckname' />
            <button type='button' onClick={handleSaveDeck} disabled={isSaving}>{isSaving ? "Speichert" : "Deck speichern" }</button>
          </div>

          {statutsMessage && <p>{statutsMessage}</p>}
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
          <p className="pool-hint">Klicke eine Karte so oft du willst, maximal 10 Karten sind erlaubt.</p>
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