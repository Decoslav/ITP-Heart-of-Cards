import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './header';
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