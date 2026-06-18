import { useEffect, useState } from 'react';
import Card from '../components/Card';
import './Duellraum.css';

function Duellraum() {
  let DeckSize = 3; // Kannst du für die Berechnung nutzen, falls nötig

  const [error, setError] = useState('');

  // Spielmodus auswählen: null = Raumauswahl, "player" = Lokal gegen Spieler, "computer" = Gegen Bot
  const [gameMode, setGameMode] = useState(null); 

  // Runden-Verwaltung
  const [activePlayer, setActivePlayer] = useState(1); // 1 = Unten, 2 = Oben
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Lebenspunkte der Spieler (Helden)
  const [player1Hp, setPlayer1Hp] = useState(30);
  const [player2Hp, setPlayer2Hp] = useState(30);

  // Kampf-Zustand: Speichert den Index der Karte, die gerade angreifen will
  const [selectedAttackerIdx, setSelectedAttackerIdx] = useState(null);

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

  // Beide Decks unabhängig voneinander aus demselben gewählten Deck laden & mischen
  useEffect(() => {
    if (!gameMode) return;

    const savedDeck = localStorage.getItem("active_duel_deck");
    if (!savedDeck) {
      setError("Kein Deck gefunden");
      return;
    }

    let parsedCards;
    try {
      parsedCards = JSON.parse(savedDeck);
    } catch {
      setError("Dein Ausgewähltes Deck ist leer");
      return;
    }

    if (!parsedCards || parsedCards.length === 0) {
      setError("Dein Ausgewähltes Deck ist leer");
      return;
    }

    // Funktion zum Mischen
    const shuffle = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Deep Copy, damit HP-Abzüge die originalen Templates nicht zerstören
    const s1 = shuffle(parsedCards).map(c => ({ ...c }));
    const s2 = shuffle(parsedCards).map(c => ({ ...c }));

    // Setups vergeben
    setHand1(s1.slice(0, 3));
    setDeck1(s1.slice(3));
    setHand2(s2.slice(0, 3));
    setDeck2(s2.slice(3));
  }, [gameMode]); // Triggert, sobald der Modus gewählt wird

  // Karte ziehen
  function drawCard() {
    if (activePlayer === 1) {
      if (deck1.length === 0) return alert('Dein Nachziehstapel ist leer!');
      setHand1([...hand1, deck1[0]]);
      setDeck1(deck1.slice(1));
    } else {
      if (deck2.length === 0) return alert('Dein Nachziehstapel ist leer!');
      setHand2([...hand2, deck2[0]]);
      setDeck2(deck2.slice(1));
    }
  }

  // Karte ausspielen (Inklusive gefixter Spell-Logik für BEIDE Spieler)
  function playCard(index) {
    if (gameMode === "computer" && activePlayer === 2) return; // Blockiert manuelle Bot-Aktionen

    if (activePlayer === 1) {
      const card = hand1[index];
      
      // SPELL LOGIK FÜR SPIELER 1 (Hier gefixt!)
      if (card.type === 'spell') {
        alert(`Spieler 1 nutzt: ${card.name}!`);
        if (card.effect === 'heal_all') {
          setField1(cur => cur.map(u => ({ ...u, hp: u.hp + 15 })));
        } else if (card.effect === 'damage_single') {
          if (field2.length > 0) {
            const rdm = Math.floor(Math.random() * field2.length);
            setField2(cur => {
              const updated = [...cur];
              updated[rdm].hp -= 12;
              if (updated[rdm].hp <= 0) {
                setGrave2(g => [...g, updated[rdm]]);
                return updated.filter((_, i) => i !== rdm);
              }
              return updated;
            });
          } else { alert('Verpufft! Keine Gegner da.'); }
        }
        setGrave1([...grave1, card]);
        setHand1(hand1.filter((_, i) => i !== index));
      } else {
        setField1([...field1, card]);
        setHand1(hand1.filter((_, i) => i !== index));
      }
    } else {
      const card = hand2[index];
      
      // SPELL LOGIK FÜR SPIELER 2
      if (card.type === 'spell') {
        alert(`Spieler 2 nutzt: ${card.name}!`);
        if (card.effect === 'heal_all') {
          setField2(cur => cur.map(u => ({ ...u, hp: u.hp + 15 })));
        } else if (card.effect === 'damage_single') {
          if (field1.length > 0) {
            const rdm = Math.floor(Math.random() * field1.length);
            setField1(cur => {
              const updated = [...cur];
              updated[rdm].hp -= 12;
              if (updated[rdm].hp <= 0) {
                setGrave1(g => [...g, updated[rdm]]);
                return updated.filter((_, i) => i !== rdm);
              }
              return updated;
            });
          } else { alert('Verpufft! Keine Gegner da.'); }
        }
        setGrave2([...grave2, card]);
        setHand2(hand2.filter((_, i) => i !== index));
      } else {
        setField2([...field2, card]);
        setHand2(hand2.filter((_, i) => i !== index));
      }
    }
  }

  // Angreifer deklarieren
  function selectAttacker(index) {
    setSelectedAttackerIdx(index);
    alert(`Unit ausgewählt. Klicke jetzt auf ein Ziel zum Angreifen!`);
  }

  // Kampf-Ausführung & TAUNT MECHANIK
  function handleAttack(targetIdx, targetIsHero = false) {
    if (selectedAttackerIdx === null) return;

    const enemyField = activePlayer === 1 ? field2 : field1;
    const attackerCard = activePlayer === 1 ? field1[selectedAttackerIdx] : field2[selectedAttackerIdx];

    // TAUNT-CHECK
    const opponentHasTaunt = enemyField.some(card => card.type === 'tank');

    if (opponentHasTaunt) {
      if (targetIsHero) {
        alert("🛡️ Spott aktiv! Du musst zuerst die gegnerischen Tanks vernichten!");
        setSelectedAttackerIdx(null);
        return;
      }
      if (enemyField[targetIdx].type !== 'tank') {
        alert("🛡️ Spott aktiv! Du darfst nur Karten vom Typ 'tank' angreifen!");
        setSelectedAttackerIdx(null);
        return;
      }
    }

    // ANGRIFFS-BERECHNUNG
    if (targetIsHero) {
      if (activePlayer === 1) {
        setPlayer2Hp(prev => Math.max(0, prev - attackerCard.atk));
      } else {
        setPlayer1Hp(prev => Math.max(0, prev - attackerCard.atk));
      }
      alert(`${attackerCard.name} greift den feindlichen Helden direkt für ${attackerCard.atk} Schaden an!`);
    } else {
      if (activePlayer === 1) {
        const defenderCard = field2[targetIdx];
        
        setField1(cur => {
          const updated = [...cur];
          updated[selectedAttackerIdx].hp -= defenderCard.atk;
          if (updated[selectedAttackerIdx].hp <= 0) setGrave1(g => [...g, updated[selectedAttackerIdx]]);
          return updated.filter(u => u.hp > 0);
        });

        setField2(cur => {
          const updated = [...cur];
          updated[targetIdx].hp -= attackerCard.atk;
          if (updated[targetIdx].hp <= 0) setGrave2(g => [...g, updated[targetIdx]]);
          return updated.filter(u => u.hp > 0);
        });
      } else {
        const defenderCard = field1[targetIdx];

        setField2(cur => {
          const updated = [...cur];
          updated[selectedAttackerIdx].hp -= defenderCard.atk;
          if (updated[selectedAttackerIdx].hp <= 0) setGrave2(g => [...g, updated[selectedAttackerIdx]]);
          return updated.filter(u => u.hp > 0);
        });

        setField1(cur => {
          const updated = [...cur];
          updated[targetIdx].hp -= attackerCard.atk;
          if (updated[targetIdx].hp <= 0) setGrave1(g => [...g, updated[targetIdx]]);
          return updated.filter(u => u.hp > 0);
        });
      }
      alert("Kampf beendet!");
    }

    setSelectedAttackerIdx(null);
  }

  function endTurn() {
    setSelectedAttackerIdx(null);
    setIsTransitioning(true);
  }

  function confirmNextTurn() {
    setActivePlayer(activePlayer === 1 ? 2 : 1);
    setIsTransitioning(false);
  }

  // Raumauswahl-Screen rendern, falls gameMode noch null ist
  if (!gameMode) {
    return (
      <div className="duellraum-page mode-selection">
        <h2>Wähle deinen Spielmodus</h2>
        <div className="mode-buttons">
          <button onClick={() => setGameMode('player')}>⚔️ Lokales Duell (2 Spieler)</button>
          <button onClick={() => setGameMode('computer')}>🤖 Gegen Computer spielen</button>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="duellraum-page error-state"><h2>⚠️ Hoppla!</h2><p>{error}</p></div>;
  }

  // GEFIXT: WIN-SCREEN ZUGEFÜGT
  if (player1Hp <= 0 || player2Hp <= 0) {
    return (
      <div className="duellraum-page win-screen">
        <h2>🏆 Das Duell ist vorbei!</h2>
        <h1>Spieler {player1Hp <= 0 ? '2 (Oben)' : '1 (Unten)'} gewinnt das Spiel!</h1>
        <button onClick={() => window.location.reload()}>Hauptmenü</button>
      </div>
    );
  }

  if (isTransitioning) {
    if (gameMode === "computer" && activePlayer === 1) {
      // Wenn Spieler 1 beendet, ist der PC direkt dran ohne Klick-Zwang
      return (
        <div className='duellraum-page transition-screen'>
          <div className='transition-card'>
            <h2>🤖 Computer ist am Zug...</h2>
            <button className="turn-btn confirm-btn" onClick={confirmNextTurn}>Zug starten</button>
          </div>
        </div>
      );
    }

    return (
      <div className="duellraum-page transition-screen">
        <div className="transition-card">
          <h2>Spieler {activePlayer === 1 ? '1' : '2'} beendet den Zug!</h2>
          <p>Übergib an <strong>Spieler {activePlayer === 1 ? '2' : '1'}</strong>.</p>
          <button className="turn-btn confirm-btn" onClick={confirmNextTurn}>Hand anzeigen</button>
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
                  <div key={`p2-back-${i}`} className="card-back-dummy"><div className="card-back-pattern">🔮</div></div>
                ))
              )}
            </div>

            <div className="field-zone enemy-field">
              <button 
                className={`hero-hp-btn ${selectedAttackerIdx !== null && activePlayer === 1 ? 'targetable' : ''}`}
                onClick={() => activePlayer === 1 && handleAttack(null, true)}
              >
                👑 {gameMode === 'computer' ? 'Computer' : 'Spieler 2'} HP: {player2Hp}
              </button>
              <div className="field-grid">
                {field2.map((card, index) => (
                  <div 
                    key={`p2-field-${index}`} 
                    className={`mini-card-wrapper ${activePlayer === 2 ? 'attacker' : 'target'} ${selectedAttackerIdx === index && activePlayer === 2 ? 'selected-atk' : ''}`}
                    onClick={() => activePlayer === 2 ? selectAttacker(index) : handleAttack(index, false)}
                  >
                    <Card {...card} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="side-system enemy-system">
            <div className={`mini-pile graveyard ${grave2.length > 0 ? '' : 'empty'}`}><span className="count">{grave2.length}</span><p>Friedhof</p></div>
            <div className={`mini-pile deck secondary ${activePlayer === 2 && gameMode === 'player' ? 'active-pull' : ''}`} onClick={activePlayer === 2 && gameMode === 'player' ? drawCard : undefined}>
              <span className="count">{deck2.length}</span><p>Stapel</p>
            </div>
          </aside>
        </section>

        {/* ================= MITTE (PHASEN-CONTROLS) ================= */}
        <div className="arena-divider">
          <div className="divider-line"></div>
          <button className="turn-btn end-turn-btn" onClick={endTurn}>
            ⚔️ Zug von {activePlayer === 1 ? 'Spieler 1' : (gameMode === 'computer' ? 'Computer' : 'Spieler 2')} beenden
          </button>
          <div className="divider-line"></div>
        </div>

        {/* ================= SPIELER 1 HÄLFTE (UNTEN) ================= */}
        <section className={`player-side player-self ${activePlayer === 1 ? 'active-glow' : 'inactive-dark'}`}>
          <aside className="side-system user-system">
            <div className={`mini-pile deck ${activePlayer === 1 ? 'active-pull' : ''}`} onClick={activePlayer === 1 ? drawCard : undefined}>
              <span className="count">{deck1.length}</span><p>Stapel</p>
            </div>
            <div className={`mini-pile graveyard ${grave1.length > 0 ? '' : 'empty'}`}><span className="count">{grave1.length}</span><p>Friedhof</p></div>
          </aside>

          <div className="side-main">
            <div className="field-zone user-field">
              <div className="field-grid">
                {field1.map((card, index) => (
                  <div 
                    key={`p1-field-${index}`} 
                    className={`mini-card-wrapper ${activePlayer === 1 ? 'attacker' : 'target'} ${selectedAttackerIdx === index && activePlayer === 1 ? 'selected-atk' : ''}`}
                    onClick={() => activePlayer === 1 ? selectAttacker(index) : handleAttack(index, false)}
                  >
                    <Card {...card} />
                  </div>
                ))}
              </div>
              <button 
                className={`hero-hp-btn ${selectedAttackerIdx !== null && activePlayer === 2 ? 'targetable' : ''}`}
                onClick={() => activePlayer === 2 && handleAttack(null, true)}
              >
                👑 Spieler 1 HP: {player1Hp}
              </button>
            </div>

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
                  <div key={`p1-back-${i}`} className="card-back-dummy"><div className="card-back-pattern">🔮</div></div>
                ))
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Duellraum;