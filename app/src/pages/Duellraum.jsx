import { useState } from 'react';
import Card from '../components/Card';
import './Duellraum.css';
import { createDuelGame, drawDuelCard, playDuelCard,
        endDuelTurn, leaveDuelGame, getSavedDecks, attackDuellTarget} from "../api/apiService";

import {PRESET_DECKS, mapCardNamesToCards, hydrateSavedCards} from "../data/cards"

function buildPresetDeckOptions(){
  return PRESET_DECKS.map((deck) =>({
    ...deck, 
    cards: mapCardNamesToCards(deck.cards),
    source: "preset",
  }));
}

async function loadAvailableDecks() {
  
  const presetDecks = buildPresetDeckOptions();

  try{
    const data = await getSavedDecks();

    if(data.success && data.decks && data.decks.length > 0)
    {
      const savedDecks = data.decks.map((deck) => ({
        id: deck.id,
        name: deck.name,
        description: "Gespeichertes Deck",
        cards: hydrateSavedCards(deck.cards),
        source: "saved",
      }));

      return [...savedDecks, ...presetDecks];
    }
  }catch{

  }

  return presetDecks;
}

function getDeckStats(deck){
  
  let hp = 0;
  let atk = 0;

  for(let card of deck.cards){
    hp+= card.hp ?? 0;
    atk+= card.atk ?? 0;
  }

  return {hp: hp, atk:atk};
}




function Duellraum() {
  const DeckSize = 3;
  let player1DeckId = null;
  let player2DeckId = null;

  if(PRESET_DECKS[0]){
    player1DeckId = PRESET_DECKS[0].id;
  }

  if(PRESET_DECKS[1]){
    player2DeckId = PRESET_DECKS[1].id;
  }else if(PRESET_DECKS[0]){
    player2DeckId = PRESET_DECKS[0].id;
  }

  const [error, setError] = useState('');
  //const [gameId, setGameId] = useState(null);

  //Spielmodus auswählen
  const [selectedMode, setSelectedMode] = useState(null);
  const [gameMode, setGameMode]  = useState(null);        //wenn null, dann raumauswahl, wenn "player" gegen spieler lokal, wenn "computer" gegen bot

  const [availableDecks, setAvailableDecks] = useState(() => buildPresetDeckOptions());
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [selectedPlayer1DeckId, setSelectedPlayer1DeckId] = useState(player1DeckId);
  const [selectedPlayer2DeckId, setSelectedPlayer2DeckId] = useState(player2DeckId);
  const [computerDeckName, setComputerDeckName] = useState("");
  const [selectedAttackerIndex, setSelectedAttackerIndex] = useState(null);
  
  
  // Runden-Verwaltung
  const [activePlayer, setActivePlayer] = useState(1); // 1 = Unten, 2 = Oben
  const [isTransitioning, setIsTransitioning] = useState(false); // Verdeckt den Screen beim Wechsel

  const [hp1, setHp1] = useState(30);
  const [hp2, setHp2] = useState(30);
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [duelMessage, setDuelMessage] = useState("");

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


  //const [availableDecks] = useState(() => loadAvailableDecks());


  const activePlayerKey = String(activePlayer);
  let opponentPlayerKey;
  let activeField;
  let opponentField;

  if(activePlayerKey === "1"){
    opponentPlayerKey = "2";
    activeField = field1;
    opponentField = field2;
  }else{
    opponentPlayerKey = "1";
    activeField = field2;
    opponentField = field1;
  }



  function findDeck(deckId) {
    return availableDecks.find((deck) => String(deck.id) === String(deckId));
  }

  function pickRandomComputerDeck(player1DeckId){
    let possibleDecks;

    if(availableDecks.length > 1){
      possibleDecks = availableDecks.filter(function(deck){
        return String(deck.id) !== String(player1DeckId);
      });

    }else{

      possibleDecks = availableDecks;
    }

    let randomIndex = Math.floor(Math.random() * possibleDecks.length);

    return possibleDecks[randomIndex];
  }

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

    setHp1(game.players["1"].hp ?? 30);
    setHp2(game.players["2"].hp ?? 30);

    setWinner(game.winner ?? null);
    setGameOver(game.gameOver ?? false);

    setSelectedAttackerIndex(null);

  }

  async function chooseRoom(mode)
  {
    resetGameState();
    setComputerDeckName("");
    setSelectedMode(mode); 
    setLoadingDecks(true);

    const decks = await loadAvailableDecks();

    setAvailableDecks(decks);
    setSelectedPlayer1DeckId(decks[0]?.id ?? "");
    setSelectedPlayer2DeckId(decks[1]?.id ?? decks[0]?.id ?? "");
    setLoadingDecks(false);
  }

  async function startDuel() {
    
    resetGameState();

    const player1Deck = findDeck(selectedPlayer1DeckId);

    if(!player1Deck || player1Deck.cards.length === 0){
      setError("Spieler 1 braucht ein gültiges Deck");
      return;
    }

    let player2Deck;

    if(selectedMode === "computer"){
      player2Deck = pickRandomComputerDeck(player1Deck.id);
    }else{
      player2Deck = findDeck(selectedPlayer2DeckId);
    }

    if(!player2Deck ||player2Deck.cards.length === 0){
      setError("Spieler 2 braucht ein gültiges Deck");
      return;
    }

    try{
      const data = await createDuelGame(selectedMode, player1Deck.cards, DeckSize, player2Deck.cards);

      if(!data.success) {
        setError(data.message || "Duell konnte nicht erstellt werden");
        return;
      }

      setComputerDeckName(selectedMode === "computer" ? player2Deck.name : "" );
      setGameMode(selectedMode);
      applyGameState(data.game);

    }catch{
      setError("Duell konnte nicht gestartet werden.");
    }

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

  function handleOwnFieldCardClick(index) {
    if(gameOver){
      return;
    }

    const card = activeField[index];

    if(!card){
      return;
    }

    if (card.type === "spell") {
    setDuelMessage("Zauberkarten können nicht normal angreifen.");
    return;
    }

    if (card.hasAttacked) {
      setDuelMessage("Diese Karte hat bereits angegriffen.");
      return;
    }

    setSelectedAttackerIndex(index);
    setDuelMessage(`${card.name} als Angreifer ausgewählt.`);

  }

  async function handleOpponentFieldCardClick(targetIndex){
    if(gameOver){
      return;
    }

    if(selectedAttackerIndex === null){
      setDuelMessage("Wähle zuerst eine eigene Karte als Angreifer aus");
      return;

    }

      try{
        const data = await attackDuellTarget(selectedAttackerIndex, "card", targetIndex);

        if(data.success){
          applyGameState(data.game);
          setDuelMessage(data.message || "Karte angegriffen");

        }else{
          setDuelMessage(data.message || "Angriff fehlgeschlagen");
        }

      }catch(error){

        console.error(error);
        setDuelMessage("Fehler beim Angriff");
      }

  }

  async function handleOpponentPlayerClick() {
    if(gameOver){
      return;
    }

    if(selectedAttackerIndex === null){
      setDuelMessage("Wähle zuerst eine eigene Karte als Angreifer aus");
      return;

    }

      try{
        const data = await attackDuellTarget(selectedAttackerIndex, "player");

        if(data.success){
          applyGameState(data.game);
          setDuelMessage(data.message || "Spieler angegriffen");

        }else{
          setDuelMessage(data.message || "Angriff fehlgeschlagen");
        }

      }catch(error){

        console.error(error);
        setDuelMessage("Fehler beim Angriff");
      }
    
  }


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

    setSelectedMode(null);
    resetGameState();
    setGameMode(null);
    setComputerDeckName("");
  }

  function renderDeckChoice(deck, selectedDeckId, onSelect){
    const selected = String(deck.id) === String(selectedDeckId);
    const stats = getDeckStats(deck);

    return(
      <button key= {`${deck.source}-${deck.id}`}
      className={`room-card deck-choice-card ${selected ? 'selected-deck' : ''}`}
        onClick={() => onSelect(deck.id)}
      >
        <span className="room-status">{deck.source === 'saved' ? 'Gespeichert' : 'Vorgefertigt'}</span>
        <h2>{deck.name}</h2>
        <p>{deck.description}</p>
        <p>
          {deck.cards.length} Karten · {stats.hp} HP · {stats.atk} ATK
        </p>
        {selected && <span className="action-tag">Ausgewählt</span>}
      </button>
    );
  }

  if(error){
    return(
      <div className='duellraum-page error-state'>
        <h2>Hoppala, ein Fehler!</h2>
        <p>{error}</p>

        <button className='turn-btn confirm-btn' onClick={() => {setError(""); setGameMode(null); setSelectedMode(null)}}> Zurück zur Raumauswahl</button> 
      
      </div>
    );
  }

  if(!gameMode  && selectedMode)
  {
    return(
      <div className='duellraum-page lobby-page'>
        <div className='duel-lobby'>
          <p className='duell-kicker'>Duellraum</p>

          <h1>Decks auswählen</h1>

          <p className='lobby-subtitle'>
            {selectedMode === "computer" ? "Wähl dein Deck, der Computer bekommt ein zufälliges." : "Wählt Decks für Spieler 1 und Spieler 2."}
          </p>

          {loadingDecks ? (<p>Lade decks...</p>)
          : (
            <>
              <h2>Spieler 1</h2>
              <div className= "room-grid">
                {availableDecks.map((deck) => renderDeckChoice(deck, selectedPlayer1DeckId, setSelectedPlayer1DeckId))}
              </div>

              {selectedMode === "player" && (
                <>
                  <h2> Spieler 2</h2>
                  <div className='room-grid' >
                    {availableDecks.map((deck) => renderDeckChoice(deck, selectedPlayer2DeckId, setSelectedPlayer2DeckId))}
                  </div>
                </>
              )}
            
              

              {selectedMode === "computer" && (
                <p className='lobby-subtitle'>
                  Der Computer wählt beim Start zufällig ein Deck aus.
                </p>
              )}

              <button className='turn-btn confirm-btn' onClick={startDuel}>
                Duell starten
              </button>

              <button className='turn-btn room-back-btn' onClick={() => {setSelectedMode(null); setComputerDeckName("");}} >
                Zurück
              </button>
            </>
          )}
        </div>
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
                {field2.map((card, index) => {
                  let className = "mini-card-wrapper attack-target"

                  if(activePlayer === 2 && selectedAttackerIndex === index){
                    className = "mini-card-wrapper selected-attacker";
                  }

                  function handleClick(){
                    if(activePlayer === 2 ){
                      handleOwnFieldCardClick(index);
                    }else{
                      handleOpponentFieldCardClick(index);
                    }
                  }

                  return (<div key={`p2-field-${index}`} className={className} onClick={handleClick}>
                          <Card {...card}/>
                          </div>
                          );
              
                })}
                {field2.length === 0 && <span className="zone-label-bg">Spieler 2 Kampfzone</span>}
              </div>
            </div>
          </div>

          {/* SPIELER 2 SYSTEME (LINKS) */}
          <aside className="side-system enemy-system">
            <div className={`mini-pile hp-pile ${activePlayer === 1 ? "attack-target" : ""}` }
              onClick={activePlayer === 1 ? handleOpponentPlayerClick : undefined}>
                <span className=' count'>{hp2}</span>
                <p>HP</p>

            </div>
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
          {duelMessage && (<p className='duel-message'>{duelMessage}</p>)}

          <button className='turn-btn room-back-btn' onClick={leaveRoom}>
                Raum Verlassen
          </button>

          <div className="divider-line"></div>
        </div>


        {/* ================= SPIELER 1 HÄLFTE (UNTEN) ================= */}
        <section className={`player-side player-self ${activePlayer === 1 ? 'active-glow' : 'inactive-dark'}`}>
          {/* SPIELER 1 SYSTEME (RECHTS) */}
          <aside className="side-system user-system">
            <div className={`mini-pile hp-pile ${activePlayer === 2 ? "attack-target" : ""}` }
              onClick={activePlayer === 2 ? handleOpponentPlayerClick : undefined}>
                <span className=' count'>{hp1}</span>
                <p>HP</p>

            </div>
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
                {field1.map((card, index) => {
                  let className = "mini-card-wrapper attack-target"

                  if(activePlayer === 1 && selectedAttackerIndex === index){
                    className = "mini-card-wrapper selected-attacker";
                  }

                  function handleClick(){
                    if(activePlayer === 1 ){
                      handleOwnFieldCardClick(index);
                    }else{
                      handleOpponentFieldCardClick(index);
                    }
                  }

                  return (<div key={`p1-field-${index}`} className={className} onClick={handleClick}>
                          <Card {...card}/>
                          </div>
                          );
              
                })}
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