import { useState } from 'react';
import './Deck.css';
import Card from '../components/Card';

function DeckPage() {
  const [selectedCards, setSelectedCards] = useState([]);

  // Logik: Hinzufügen zum Deck
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

  // Logik: Aus dem Deck entfernen
  const handleRemoveCard = (cardName) => {
    setSelectedCards((prev) => prev.filter(card => card.name !== cardName));
  };

  return (
    <div className="builder-layout">
      
      {/* --- DECK BEREICH (OBEN) --- */}
      <section className="deck-section">
        <div className="section-header">
          <h2>Mein Deck ({selectedCards.length} / 20)</h2>
          <p>Klicke eine Karte, um sie zu entfernen</p>
        </div>
        
        <div className="deck-grid">
          {selectedCards.map((card, index) => (
            <Card 
              key={`deck-${index}`}
              {...card} 
              onCardClick={() => handleRemoveCard(card.name)} 
            />
          ))}
          {/* Platzhalter, falls Deck leer ist */}
          {selectedCards.length === 0 && (
            <div className="empty-slot">Wähle Karten aus dem Pool...</div>
          )}
        </div>
      </section>

      <div className="divider"></div>

      {/* --- POOL BEREICH (UNTEN) --- */}
      <section className="pool-section">
        <h3>Verfügbare Karten (Pool)</h3>
        <div className="deck-grid">
          <Card 
            name="Feuerdrache" hp={25} atk={8} imageUrl="🔥" 
            onCardClick={() => handleAddCard({ name: "Feuerdrache", hp: 25, atk: 8, imageUrl: "🔥" })} 
          />
          <Card 
            name="Eishexe" hp={20} atk={5} imageUrl="/images/hexe.png" 
            onCardClick={() => handleAddCard({ name: "Eishexe", hp: 20, atk: 5, imageUrl: "/images/hexe.png" })}
          />
          <Card 
            name="Mage" hp={15} atk={10} imageUrl="/images/Mage.png" 
            onCardClick={() => handleAddCard({ name: "Mage", hp: 15, atk: 10, imageUrl: "/images/Mage.png" })}
          />
          <Card 
            name="Knight" hp={50} atk={5} imageUrl="🧎" 
            onCardClick={() => handleAddCard({ name: "Knight", hp: 50, atk: 5, imageUrl: "🧎" })}
          />
          {/* Hier kannst du noch 16 weitere Karten einfügen */}
          <Card 
            name="Summoner" hp={15} atk={15} imageUrl="🧙‍♂️" 
            onCardClick={() => handleAddCard({ name: "Summoner", hp: 15, atk: 15, imageUrl: "🧙‍♂️" })} 
          />
          <Card 
            name="Shadow-Ninja" hp={12} atk={18} imageUrl="/images/ShadowNinja.png" 
            onCardClick={() => handleAddCard({ name: "Shadow-Ninja", hp: 12, atk: 18, imageUrl: "/images/ShadowNinja.png" })} 
          />
          <Card 
            name="Gnome" hp={30} atk={4} imageUrl="🍄" 
            onCardClick={() => handleAddCard({ name: "Gnome", hp: 30, atk: 4, imageUrl: "🍄" })}
          />
          <Card 
            name="Thunderbird" hp={22} atk={12} imageUrl="⚡" 
            onCardClick={() => handleAddCard({ name: "Thunderbird", hp: 22, atk: 12, imageUrl: "⚡" })}
          />
          <Card 
            name="Ice-Golem" hp={60} atk={2} imageUrl="❄️" 
            onCardClick={() => handleAddCard({ name: "Ice-Golem", hp: 60, atk: 2, imageUrl: "❄️" })}
          />

          <Card 
            name="Bone-Warrior" hp={10} atk={20} imageUrl="💀" 
            onCardClick={() => handleAddCard({ name: "Bone-Warrior", hp: 10, atk: 20, imageUrl: "💀" })} 
          />

          <Card 
            name="Sea-Guardian" hp={40} atk={6} imageUrl="🔱" 
            onCardClick={() => handleAddCard({ name: "Sea-Guardian", hp: 40, atk: 6, imageUrl: "🔱" })} 
          />

          <Card 
            name="Phoenix" hp={20} atk={12} imageUrl="🐦‍🔥" 
            onCardClick={() => handleAddCard({ name: "Phoenix", hp: 20, atk: 12, imageUrl: "🐦‍🔥" })} 
          />
        </div>
      </section>

    </div>
  );
}

export default DeckPage;