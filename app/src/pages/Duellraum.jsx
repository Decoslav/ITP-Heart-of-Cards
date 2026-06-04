import { useEffect, useState } from 'react';
import Card from '../components/Card';
import './Duellraum.css';

function Duellraum() {
  const [deck, setDeck] = useState([]);           // Nachziehstapel (seitlich)
  const [hand, setHand] = useState([]);           // Karten auf der Hand (unten)
  const [field, setField] = useState([]);         // Karten auf dem Spielfeld (Mitte)
  const [graveyard, setGraveyard] = useState([]); // Karten im Friedhof (seitlich)
  const [error, setError] = useState('');

  // Deck laden und mischen beim Start
  useEffect(() => {
    const savedDeck = localStorage.getItem('active_duel_deck');
    if (!savedDeck) {
      setError('Kein Deck gefunden! Erstelle zuerst ein Deck im Deckbuilder.');
      return;
    }

    const parsedCards = JSON.parse(savedDeck);
    if (parsedCards.length === 0) {
      setError('Dein ausgewähltes Deck ist leer. Pack zuerst Karten hinein!');
      return;
    }

    const shuffled = [...parsedCards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setHand(shuffled.slice(0, 3));
    setDeck(shuffled.slice(3));
  }, []);

  // Karte ziehen
  function drawCard() {
    if (deck.length === 0) {
      alert('Keine Karten mehr im Nachziehstapel!');
      return;
    }
    const nextCard = deck[0];
    setDeck(curDeck => curDeck.slice(1));
    setHand(curHand => [...curHand, nextCard]);
  }

  // Karte von der Hand aufs Spielfeld legen
  function playCard(handIdx) {
    const cardToPlay = hand[handIdx];
    setHand(curHand => curHand.filter((_, i) => i !== handIdx));
    setField(curField => [...curField, cardToPlay]);
  }

  // Karte vom Spielfeld auf den Friedhof schicken
  function sendToGraveyard(fieldIdx) {
    const cardToDestroy = field[fieldIdx];
    setField(curField => curField.filter((_, i) => i !== fieldIdx));
    setGraveyard(curGrave => [cardToDestroy, ...curGrave]); // Neueste Karte oben auflegen
  }

  if (error) {
    return (
      <div className="duellraum-page error-state">
        <h2>⚠️ Hoppla!</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="duellraum-page">
      <header className="duell-header">
        <h1>⚔️ Das Duell beginnt ⚔️</h1>
      </header>

      {/* DAS NEUE ARENA-LAYOUT */}
      <main className="arena-container">
        
        {/* LINKE SEITE & MITTE: DAS HAUPTSPIELFELD */}
        <section className="main-battlezone">
          
          {/* MITTE: DAS SPIELFELD */}
          <div className="battlefield-zone">
            <h3>⚔️ Spielfeld</h3>
            <div className="battlefield-grid">
              {field.map((card, index) => (
                <div key={`field-${card.name}-${index}`} className="field-card-wrapper" onClick={() => sendToGraveyard(index)}>
                  <Card {...card} />
                  <div className="card-overlay-hint">Zerstören</div>
                </div>
              ))}
              {field.length === 0 && (
                <p className="empty-zone-txt">Klicke eine Karte auf deiner Hand an, um sie auszuspielen!</p>
              )}
            </div>
          </div>

          {/* UNTEN: DEINE KARTENHAND */}
          <div className="player-hand-zone">
            <h3>👋 Deine Hand ({hand.length} Karten)</h3>
            <div className="player-hand-grid">
              {hand.map((card, index) => (
                <div key={`hand-${card.name}-${index}`} className="hand-card-wrapper" onClick={() => playCard(index)}>
                  <Card {...card} />
                  <div className="card-overlay-hint">Ausspielen</div>
                </div>
              ))}
              {hand.length === 0 && (
                <p className="empty-zone-txt">Keine Karten auf der Hand. Zieh eine neue Karte!</p>
              )}
            </div>
          </div>

        </section>

        {/* RECHTE SEITE: DIE SYSTEM-ZONEN (SIDEBAR) */}
        <aside className="sidebar-zones">
          
          {/* NACHZIEHSTAPEL */}
          <div className={`card-deck-pile ${deck.length > 0 ? 'has-cards' : 'empty'}`} onClick={drawCard}>
            <div className="pile-inner">
              <span className="pile-count">{deck.length}</span>
              <p>Stapel</p>
              {deck.length > 0 && <small className="draw-hint">Ziehen</small>}
            </div>
          </div>

          {/* FRIEDHOF */}
          <div className={`card-graveyard-pile ${graveyard.length > 0 ? 'has-cards' : 'empty'}`}>
            <div className="pile-inner">
              <span className="pile-count">{graveyard.length}</span>
              <p>Friedhof</p>
              {graveyard.length > 0 && (
                <small className="last-dead-card">Oben: {graveyard[0].name}</small>
              )}
            </div>
          </div>

        </aside>

      </main>
    </div>
  );
}

export default Duellraum;