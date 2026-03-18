import { Link } from 'react-router-dom';
import './header.css'; // WICHTIG: Hier laden wir das CSS!

function Navbar({ isLoggedIn }) {
  return (
    <nav className="navbar">
      <div className="logo">🃏 Heart of Cards</div>
      
      <ul className="nav-links">
        <li><Link to="/" className="nav-link">Home</Link></li>
        <li><Link to="/faq" className="nav-link">FAQ</Link></li>
        
        {isLoggedIn && (
          <>
            <li><Link to="/deckbuilder" className="nav-link">Deckbuilder</Link></li>
            <li><Link to="/duell" className="nav-link">Duellraum</Link></li>
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