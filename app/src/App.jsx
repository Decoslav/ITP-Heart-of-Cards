import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FAQPage from './pages/FAQ';
import DeckPage from './pages/Deck';
import Deckbuilder from './pages/Deckbuilder';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Duellraum from './pages/Duellraum';
import { logout } from './api/apiService';
import { useState } from 'react';

function ProtectedRoute({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/" replace />;
}


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("user"));

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
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/deckbuilder" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Deckbuilder /></ProtectedRoute>} />
          <Route path="/deck"        element={<ProtectedRoute isLoggedIn={isLoggedIn}><DeckPage /></ProtectedRoute>} />
          <Route path="/duell"       element={<ProtectedRoute isLoggedIn={isLoggedIn}><Duellraum /></ProtectedRoute>} />
          <Route path="/profile"     element={<ProtectedRoute isLoggedIn={isLoggedIn}><Profile /></ProtectedRoute>} />
          <Route path="/registration" element={<Registration setIsLoggedIn={setIsLoggedIn}/>}/>
          <Route path="/login" element = {<Login setIsLoggedIn={setIsLoggedIn}/>}/>
        </Routes>
      </div>

    </Router>
  );
}



export default App;