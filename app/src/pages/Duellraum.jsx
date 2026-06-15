import { useEffect, useState } from 'react';
import Card from '../components/Card';
import './Duellraum.css';

function Duellraum() {
  let DeckSize = 3;

  const [error, setError] = useState('');

  //Spielmodus auswählen
  const [gameMode, setGameMode]  = useState(null);        //wenn null, dann raumauswahl, wenn "player" gegen spieler lokal, wenn "computer" gegen bot

  
  // Runden-Verwaltung
  const [activePlayer, setActivePlayer] = useState(1); // 1 = Unten, 2 = Oben
  const [isTransitioning, setIsTransitioning] = useState(false); // Verdeckt den Screen beim Wechsel

  // Zustand für Spieler 1 (Unten)
  const [deck1, setDeck1] = useState([]);
  const [hand1, setHand1] = useState([]);
  const [field1, setField1] = useState([]);
  const [grave1, setGrave1] = useState([]);

  // Zustand für Spieler 2 (Oben)
  const [deck2, setDeck2] = useState([]);
  const [hand2, setHand2] = useState([]);
  const [field2, setField2] = useState([]);
  const [grave2, setGrave2] = useState([]);

  function resetGameState()
  {
    setError ("");
    setActivePlayer(1);
    setIsTransitioning(false);

    setDeck1([]);
    setHand1([])
    setField1([]);
    setGrave1([]);

    setDeck2([]);
    setHand2([]);
    setField2([]);
    setGrave2([]);
  }

  function chooseRoom(mode)
  {
    resetGameState();
    setGameMode(mode);
  }

  useEffect(() => {

    if(!gameMode)
    {
      return;
    }

    const savedDeck = localStorage.getItem("active_duel_deck");

    if(!savedDeck)
    {
      setError("Kein Deck gefunden");
      return;
    }

    let parsedCards;
    try{
      parsedCards = JSON.parse(savedDeck);
    }catch
    {
      setError("Dein Ausgewähltes Deck ist leer");
      return;
    }

    if(!parsedCards || parsedCards.length === 0)
    {
      setError("Dein Ausgewähltes Deck ist leer");
      return;
    }

    const shuffle = (array) =>
    {
      const shuffled = [...array];

      for(let i = shuffled.length -1; i > 0 ; i-- )
      {
        const j = Math.floor(Math.random()* (i+1));
        
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return shuffled;
    };
  

    const s1 = shuffle(parsedCards);
    const s2 = shuffle(parsedCards);

    // Spieler 1 Setup
    setHand1(s1.slice(0, DeckSize));
    setDeck1(s1.slice(DeckSize));

    // Spieler 2 Setup
    setHand2(s2.slice(0, DeckSize));
    setDeck2(s2.slice(DeckSize));
  }, [gameMode]);

  // Karte ziehen (Nur für den aktiven Spieler)
  function drawCard() {
    if (activePlayer === 1) {
      if (deck1.length === 0) 
        {
          return alert('Dein Nachziehstapel ist leer!');
        }

      setHand1([...hand1, deck1[0]]);
      setDeck1(deck1.slice(1));

    } else {
      if (deck2.length === 0)
        {
          return alert('Dein Nachziehstapel ist leer!');
        }

      setHand2([...hand2, deck2[0]]);
      setDeck2(deck2.slice(1));
    }
  }

  // Karte ausspielen (Nur für den aktiven Spieler)
  function playCard(index) {

    if(gameMode ==="computer" && activePlayer ===2)
    {
      return;
    }

    if (activePlayer === 1) {
      setField1([...field1, hand1[index]]);
      setHand1(hand1.filter((_, i) => i !== index));

    } else {
      setField2([...field2, hand2[index]]);
      setHand2(hand2.filter((_, i) => i !== index));
    }
  }

  //Hier Computer Logik aus PHP?

  // Zug beenden & Bildschirm wechseln
  function endTurn() {
    setIsTransitioning(true);
  }

  function performComputerTurn()
  {
    //hier irgendwas vom server oder so
  }

  function getCurrentPlayerName()
  {
    if(activePlayer === 1 )
    {
      return "Spieler 1";
    }
    if(gameMode === "computer")
    {
      return "Computer";
    }

    return "Spieler 2";
  }

  function confirmNextTurn() {
    setActivePlayer(activePlayer === 1 ? 2 : 1);
    setIsTransitioning(false);
  }

  if (!gameMode) {
    return (
      <div className="duellraum-page lobby-page">
        <div className='duel-lobby'>

          <p className='duell-lobby'> Duellraum </p>

          <h1> Wähle einen Raum</h1>

          <p className = "lobby-subtitle">Entscheide, ob du gegen einen BOT oder gegen deinen Freund spielen willst.</p>
        
        
          <div className='room-grid'>
            <button className='room-card' onClick={() => chooseRoom("player")}>
              <span className='room-icon'> ⚔️ </span>
              <h2>Gegeneinander</h2>
              <p> Zwei Spieler am selben Gerät</p>
              <span className='room-status'> 2-Spieler-Raum</span>
            </button>

            <button className='room-card' onClick={() => chooseRoom("computer")}>
              <span className='room-icon'> 🤖 </span>
              <h2>Gegen BOT</h2>
              <p> Du spielst gegen einen Computer</p>
              <span className='room-status'> 2-Spieler-Raum</span>
            </button>



          </div>
        </div> 
      </div>
    );
  }

  if(error){
    return(
      <div className='duellraum-page error-state'>
        <h2>Hoppala, ein Fehler!</h2>
        <p>{error}</p>

        <button className='turn-btn confirm-btn' onClick={() => setGameMode(null)}> Zurück zur Raumauswahl</button> 
      
      </div>
    );
  }

  // Sichtschutz-Overlay bei Spielerwechsel (Spionage-Schutz)
  if (isTransitioning) {

    if(gameMode === "computer")
    {
      return(
        <div className='duellraum-page transition-screen'>
          <div className='transition-card'>
            <h2> Computer ist am Zug</h2>
            <p>Der Computer zieht eine Karte und spielt.</p>
          </div>
        </div>
      );
    }


    return (
      <div className="duellraum-page transition-screen">
        <div className="transition-card">
          <h2>Spieler {activePlayer === 1 ? '1' : '2'} hat seinen Zug beendet!</h2>
          <p>Übergib den Computer an <strong>Spieler {activePlayer === 1 ? '2' : '1'}</strong>.</p>
          <button className="turn-btn confirm-btn" onClick={confirmNextTurn}>
            Ich bin Spieler {activePlayer === 1 ? '2' : '1'} (Hand anzeigen)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="duellraum-page">
      <div className="arena-fullscreen">
        
        {/* ================= SPIELER 2 HÄLFTE (OBEN) ================= */}
        <section className={`player-side enemy-side ${activePlayer === 2 ? 'active-glow' : 'inactive-dark'}`}>
          <div className="side-main">
            
            {/* SPIELER 2 HAND (Verdeckt, wenn S1 am Zug ist) */}
            <div className="hand-zone enemy-hand">
              {activePlayer === 2 && gameMode === "player" ? (
                hand2.map((card, index) => (
                  <div key={`p2-hand-${index}`} className="mini-card-wrapper click-play" onClick={() => playCard(index)}>
                    <Card {...card} />
                    <div className="card-action-overlay color-green">Spielen</div>
                  </div>
                ))
              ) : (
                Array.from({ length: hand2.length }).map((_, i) => (
                  <div key={`p2-back-${i}`} className="card-back-dummy">
                    <div className="card-back-pattern">🔮</div>
                  </div>
                ))
              )}
              {hand2.length === 0 && <p className="empty-hand-hint">Keine Karten auf der Hand.</p>}
            </div>

            {/* SPIELER 2 SPIELFELD */}
            <div className="field-zone enemy-field">
              <div className="field-grid">
                {field2.map((card, index) => (
                  <div key={`p2-field-${index}`} className="mini-card-wrapper">
                    <Card {...card} />
                  </div>
                ))}
                {field2.length === 0 && <span className="zone-label-bg">Spieler 2 Kampfzone</span>}
              </div>
            </div>
          </div>

          {/* SPIELER 2 SYSTEME (LINKS) */}
          <aside className="side-system enemy-system">
            <div className="mini-pile graveyard empty">
              <span className="count">{grave2.length}</span>
              <p>Friedhof</p>
            </div>
            <div className={`mini-pile deck secondary ${activePlayer === 2 && gameMode === "player" ? 'active-pull' : ''}`} onClick={activePlayer === 2 && gameMode === "player" ? drawCard : undefined}>
              <span className="count">{deck2.length}</span>
              <p>Stapel</p>
              {activePlayer === 2 && gameMode === "player" && deck2.length > 0 && <span className="action-tag">Zieh</span>}
            </div>
          </aside>
        </section>


        {/* ================= MITTELBAR MIT PHASEN-CONTROLS ================= */}
        <div className="arena-divider">
          <div className="divider-line"></div>
          <button className="turn-btn end-turn-btn" onClick={endTurn}>
            ⚔️ Zug von Spieler {getCurrentPlayerName()} beenden
          </button>

          <button className='turn-btn room-back-btn' onClick={() => setGameMode(null)}>
                Raum Verlassen
          </button>

          <div className="divider-line"></div>
        </div>


        {/* ================= SPIELER 1 HÄLFTE (UNTEN) ================= */}
        <section className={`player-side player-self ${activePlayer === 1 ? 'active-glow' : 'inactive-dark'}`}>
          {/* SPIELER 1 SYSTEME (RECHTS) */}
          <aside className="side-system user-system">
            <div className={`mini-pile deck ${activePlayer === 1 ? 'active-pull' : ''}`} onClick={activePlayer === 1 ? drawCard : undefined}>
              <span className="count">{deck1.length}</span>
              <p>Stapel</p>
              {activePlayer === 1 && deck1.length > 0 && <span className="action-tag">Zieh</span>}
            </div>
            <div className="mini-pile graveyard empty">
              <span className="count">{grave1.length}</span>
              <p>Friedhof</p>
            </div>
          </aside>

          <div className="side-main">
            {/* SPIELER 1 SPIELFELD */}
            <div className="field-zone user-field">
              <div className="field-grid">
                {field1.map((card, index) => (
                  <div key={`p1-field-${index}`} className="mini-card-wrapper">
                    <Card {...card} />
                  </div>
                ))}
                {field1.length === 0 && <span className="zone-label-bg">Spieler 1 Kampfzone</span>}
              </div>
            </div>

            {/* SPIELER 1 HAND (Verdeckt, wenn S2 am Zug ist) */}
            <div className="hand-zone user-hand">
              {activePlayer === 1 ? (
                hand1.map((card, index) => (
                  <div key={`p1-hand-${index}`} className="mini-card-wrapper click-play" onClick={() => playCard(index)}>
                    <Card {...card} />
                    <div className="card-action-overlay color-green">Spielen</div>
                  </div>
                ))
              ) : (
                Array.from({ length: hand1.length }).map((_, i) => (
                  <div key={`p1-back-${i}`} className="card-back-dummy">
                    <div className="card-back-pattern">🔮</div>
                  </div>
                ))
              )}
              {hand1.length === 0 && <p className="empty-hand-hint">Keine Karten mehr!</p>}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Duellraum;