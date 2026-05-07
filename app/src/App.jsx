import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FAQPage from './pages/FAQ';
import DeckPage from './pages/Deck';
import Deckbuilder from './pages/Deckbuilder';
import Profile from './pages/Profile';
import Login from './pages/Login'
import { logout } from './api/apiService';
import { useState } from 'react';


function App() {
  // Simulierter Login-Status (später kommt das aus der Datenbank)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  async function handleLogout() {
    try{
      await logout();
    }catch (error){
      console.error("Logout fehlgeschlagen:", error);
    }
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  }

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout}/>
      
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/deckbuilder" element={<Deckbuilder />} />

          <Route path="/deck" element={<DeckPage/>} />
          <Route path="/duell" element={<h1>Bereit zum Duell?</h1>} />
          <Route path="/profile" element={<Profile />}/>
          <Route path="/login" element = {<Login setIsLoggedIn={setIsLoggedIn}/>}/>
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