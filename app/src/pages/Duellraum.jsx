import { useState } from 'react';
import Card from '../components/Card';
import './Duellraum.css';
import { createDuelGame, drawDuelCard, playDuelCard,
        endDuelTurn, leaveDuelGame } from "../api/apiService";

function Duellraum() {
  const DeckSize = 3;

  const [error, setError] = useState('');
  const [gameId, setGameId] = useState(null);

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

  function applyGameState(game)
  {
    setActivePlayer(game.activePlayer);

    setDeck1(game.players["1"].deck);
    setHand1(game.players["1"].hand)
    setField1(game.players["1"].field);
    setGrave1(game.players["1"].grave);

    setDeck2(game.players["2"].deck);
    setHand2(game.players["2"].hand);
    setField2(game.players["2"].field);
    setGrave2(game.players["2"].grave);

  }

  async function chooseRoom(mode)
  {
    resetGameState();
    
    const savedDeck= localStorage.getItem("active_duel_deck");

    if(!savedDeck)
    {
      setError("Kein Deck gefunden");
      return;
    }

    let parsedDeck;

    try{
      parsedDeck = JSON.parse(savedDeck);
    }catch
    {
      setError("Dein Deck konnte nicht geladen werden");
      return;
    }

    if(!parsedDeck ||parsedDeck.length === 0){
      
      setError("Das Deck ist leer");
      return;
    }

    const data = await createDuelGame(mode, parsedDeck, DeckSize);

    if(!data.success){
      
      setError(data.message);
      return;
    }

    setGameMode(mode);
    setGameId(data.gameId);
    applyGameState(data.game);

  }
 
  

  // Karte ziehen (Nur für den aktiven Spieler)
  async function drawCard() {
    
    if(gameMode === "computer" && activePlayer === 2)
    {
      return;
    }

    const data = await drawDuelCard();

    if(!data.success){
      alert(data.message);
      return;
    }

    applyGameState(data.game);

  }

  // Karte ausspielen (Nur für den aktiven Spieler)
  async function playCard(index) {

    if(gameMode === "computer" && activePlayer === 2){
      return;
    }

    const data = await playDuelCard(index);

    if(!data.success){
      alert(data.message);
      return;
    }

    applyGameState(data.game);

  }

  //Hier Computer Logik aus PHP?

  // Zug beenden & Bildschirm wechseln
  async function endTurn() {
    
    if(gameMode === "player"){
      setIsTransitioning(true);
      return;
    }

    setIsTransitioning(true);

    const data = await endDuelTurn();

    if(!data.success){
      setIsTransitioning(false);
      alert(data.message);
      return;
    }

    setTimeout(() => {
      applyGameState(data.game);
      setIsTransitioning(false);
    }, 800);

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

  async function confirmNextTurn() {
    
    const data = await endDuelTurn();

    if(!data.success){
      setIsTransitioning(false);
      alert(data.message);
      return;
    }

    applyGameState (data.game);
    setIsTransitioning(false);

  }

  async function leaveRoom() {
    
    await leaveDuelGame();

    resetGameState();
    setGameId(null);
    setGameMode(null);
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

  if (!gameMode) {
    return (
      <div className="duellraum-page lobby-page">
        <div className='duel-lobby'>

          <p className='duell-kicker'> Duellraum </p>

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
              <span className='room-status'> Einzelspieler-Raum</span>
            </button>



          </div>
        </div> 
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
            ⚔️ Zug von {getCurrentPlayerName()} beenden
          </button>

          <button className='turn-btn room-back-btn' onClick={leaveRoom}>
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