import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FAQPage from './pages/FAQ';
import DeckPage from './pages/Deck';
import Deckbuilder from './pages/Deckbuilder';
import { useState } from 'react';


function App() {
  // Simulierter Login-Status (später kommt das aus der Datenbank)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} />
      
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/deckbuilder" element={<Deckbuilder />} />


          <Route path="/deck" element={<DeckPage/>} />
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