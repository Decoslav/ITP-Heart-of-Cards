import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Card from './Card';
import { useState } from 'react';

function App() {
  // Simulierter Login-Status (später kommt das aus der Datenbank)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} />
      
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<h1>Willkommen auf der Home-Seite</h1>} />
          <Route path="/faq" element={<h1>Häufig gestellte Fragen (FAQ)</h1>} />
          <Route path="/deckbuilder" element={<h1>Baue dein 20-Karten-Deck</h1>} />
          <Route path="/deck" element={<div style={{ display: 'flex', gap: '20px', padding: '40px' }}>
      {/* Hier erstellen wir drei verschiedene Karten mit einer Komponente! */}
      <Card name="Feuerdrache" hp={25} atk={8} imageUrl="🔥" />
      <Card name="Eishexe" hp={20} atk={5} imageUrl="/images/hexe.png" />
      <Card name="Mage" hp={15} atk={10} imageUrl="/images/Mage.png" />
    </div>} />
          <Route path="/duell" element={<h1>Bereit zum Duell?</h1>} />
        </Routes>
      </div>

      {/* Button zum Testen der Navbar-Logik */}
      <button onClick={() => setIsLoggedIn(!isLoggedIn)} style={{margin: '20px'}}>
        {isLoggedIn ? "Log mich aus" : "Log mich ein (Simuliert)"}
      </button>
    </Router>
  );
}



export default App;