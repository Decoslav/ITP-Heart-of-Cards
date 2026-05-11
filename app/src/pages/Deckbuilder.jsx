import { useState } from 'react';
import './Deck.css';
import Card from '../components/Card';

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
  { name: "Gnome", hp: 30, atk: 4, imageUrl: "/images/Gnome.png", type: "hybrid", description: "After 1000 years he learned to control lighnting."},
  { name: "Thunderbird", hp: 22, atk: 12, imageUrl: "/images/ThunderBird.png", type: "hybrid", description: "In the east they call her 'Taifun', in the west 'Hurricane' and in the south 'Cyclone'."},
  { name: "Phoenix", hp: 20, atk: 12, imageUrl: "/images/Phoenix.png", type: "hybrid", description: "Phoenix never dies."},
  { name: "Bowser", hp: 30, atk: 7, imageUrl: "/images/Bowser.png", type: "hybrid", description: "His name is 'Cupcake' and he doesn't bite."},
  { name: "Dragon Monk", hp: 24, atk: 10, imageUrl: "/images/dragon_monk.png", type: "hybrid", description: "After training Kung Fu everyday he mastered the dragon fist."},
];

function DeckPage() {
  const [selectedCards, setSelectedCards] = useState([]);

  const handleAddCard = (cardData) => {
    const isAlreadyInDeck = selectedCards.some(card => card.name === cardData.name);
    if (selectedCards.length < 20 && !isAlreadyInDeck) {
      setSelectedCards((prev) => [...prev, cardData]);
    } else if (isAlreadyInDeck) {
      alert("Karte schon im Deck!");
    } else {
      alert("Deck ist voll!");
    }
  };

  const handleRemoveCard = (cardName) => {
    setSelectedCards((prev) => prev.filter(card => card.name !== cardName));
  };

  return (
    <div className="builder-layout">
      
      {/* --- DECK BEREICH --- */}
      <section className="deck-section">
        <div className="section-header">
          <h2>Mein Deck ({selectedCards.length} / 20)</h2>
          <p>Klicke eine Karte zum Entfernen</p>
        </div>
        
        <div className="deck-grid">
          {selectedCards.map((card, index) => (
            <Card 
              key={`deck-${index}`}
              {...card} 
              onCardClick={() => handleRemoveCard(card.name)} 
            />
          ))}
          {selectedCards.length === 0 && (
            <div className="empty-slot">Wähle Karten aus dem Pool...</div>
          )}
        </div>
      </section>

      <div className="divider"></div>

      {/* --- POOL BEREICH --- */}
      <section className="pool-section">
        <h2>Verfügbare Karten</h2>

        <h3>🛡️ Tanks</h3>
        <div className="deck-grid">
          {ALL_CARDS.filter(c => c.type === "tank").map(card => (
            <Card key={card.name} {...card} onCardClick={() => handleAddCard(card)} />
          ))}
        </div>

        <h3>⚔️ Damage</h3>
        <div className="deck-grid">
          {ALL_CARDS.filter(c => c.type === "damage").map(card => (
            <Card key={card.name} {...card} onCardClick={() => handleAddCard(card)} />
          ))}
        </div>

        <h3>⚖️ Hybrid</h3>
        <div className="deck-grid">
          {ALL_CARDS.filter(c => c.type === "hybrid").map(card => (
            <Card key={card.name} {...card} onCardClick={() => handleAddCard(card)} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default DeckPage;