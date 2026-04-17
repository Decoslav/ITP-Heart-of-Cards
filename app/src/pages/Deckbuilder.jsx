import { useState, useEffect } from 'react';
import './Deckbuilder.css';
import Card from '../components/Card';

function DeckPage() {
  // Das ist dein Array für die ausgewählten Karten
  const [selectedCards, setSelectedCards] = useState([]);

  // Funktion zum Hinzufügen
  const handleAddCard = (cardData) => {
    const isAlreadyInDeck = selectedCards.some(card => card.name === cardData.name);

    // 2. Prüfen, ob das Deck schon voll ist
    if (selectedCards.length >= 4) {
      alert("Dein Deck ist voll! Maximal 20 Karten erlaubt.");
      return; // Funktion abbrechen
    }

    // 3. Wenn sie schon drin ist, Fehlermeldung ausgeben
    if (isAlreadyInDeck) {
      alert(`${cardData.name} ist bereits in deinem Deck! Jede Karte nur 1x.`);
      return; // Funktion abbrechen
    }
      setSelectedCards((prev) => [...prev, cardData]);
  };

  // Ausgabe in der Konsole, sobald sich das Array ändert
  useEffect(() => {
    console.log("Aktuelles Deck:", selectedCards);
  }, [selectedCards]);

  return (
    <div className="deck-container">
      {/* Wir übergeben die Funktion an die Card Komponente.
         Ich nutze hier beispielhafte Daten.
      */}
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
      
      {/* Hier könnten noch 16 weitere Karten stehen... */}
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
    </div>
  );
}

export default DeckPage;