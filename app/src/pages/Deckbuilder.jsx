import { useState } from 'react';
import './Deck.css';
import Card from '../components/Card';

const ALL_CARDS = [
  // TANKS
  { name: "Knight", hp: 50, atk: 5, imageUrl: "/images/Knight.png", type: "tank" },
  { name: "Ice-Golem", hp: 60, atk: 2, imageUrl: "/images/IceGolem.png", type: "tank" },
  { name: "Sea-Guardian", hp: 40, atk: 6, imageUrl: "/images/SeaGuardian.png", type: "tank" },
  { name: "Ender-Dragon", hp: 50, atk: 5, imageUrl: "/images/EnderDragon.png", type: "tank" },

  // DAMAGE
  { name: "Bone-Warrior", hp: 10, atk: 20, imageUrl: "/images/BoneWarrior.png", type: "damage" },
  { name: "Ice-Mage", hp: 15, atk: 20, imageUrl: "/images/IceMage.png", type: "damage" },
  { name: "Goblin", hp: 15, atk: 10, imageUrl: "/images/Goblin.png", type: "damage" },
  { name: "Shadow-Ninja", hp: 12, atk: 18, imageUrl: "/images/ShadowNinja.png", type: "damage" },
  { name: "Summoner", hp: 15, atk: 15, imageUrl: "/images/Summoner.png", type: "damage" },

  // HYBRID
  { name: "Fire-Dragon", hp: 25, atk: 8, imageUrl: "/images/FireDragon.png", type: "hybrid" },
  { name: "Ice-Witch", hp: 20, atk: 5, imageUrl: "/images/IceWitch.png", type: "hybrid" },
  { name: "Gnome", hp: 30, atk: 4, imageUrl: "/images/Gnome.png", type: "hybrid" },
  { name: "Thunderbird", hp: 22, atk: 12, imageUrl: "/images/ThunderBird.png", type: "hybrid" },
  { name: "Phoenix", hp: 20, atk: 12, imageUrl: "/images/Phoenix.png", type: "hybrid" },
  { name: "Bowser", hp: 35, atk: 10, imageUrl: "/images/Bowser.png", type: "hybrid" }
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