import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ isLoggedIn }) {
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to= "/">🃏 Heart of Cards</Link>
      </div>
      
      <ul className="nav-links">
        <li><Link to="/" className="nav-link">Home</Link></li>
        <li><Link to="/faq" className="nav-link">FAQ</Link></li>
        
        {isLoggedIn && (
          <>
            <li><Link to="/deckbuilder" className="nav-link">Deckbuilder</Link></li>
            <li><Link to="/duell" className="nav-link">Duellraum</Link></li>
            <li><Link to="/deck" className="nav-link">Deck</Link></li>
            <li><Link to="/profile" className="nav-link">Profil</Link></li>
          </>
        )}
      </ul>

      <div className="auth">
        <button className="auth-btn">
          {isLoggedIn ? "Logout" : "Login"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;