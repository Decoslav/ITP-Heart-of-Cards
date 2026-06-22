import { Link } from 'react-router-dom';
import './Home.css';
import '../styles/shared.css';

function Home({ isLoggedIn }) {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    const username = storedUser?.username;

    if (isLoggedIn) {
        return (
            <div className="home-page page-bg">
                <p className="home-kicker">Willkommen zurück</p>
                <h1>Hey {username ?? 'Duellant'}!</h1>
                <p className="home-subtitle">Bereit für die nächste Runde? Bau dein Deck oder starte direkt ein Duell.</p>

                <div className="home-actions">
                    <Link className="home-btn" to="/duell">⚔️ Duell starten</Link>
                    <Link className="home-btn secondary" to="/deckbuilder">Deck bauen</Link>
                    <Link className="home-btn secondary" to="/profile">Profil</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="home-page">
            <p className="home-kicker">Heart of Cards</p>
            <h1>Willkommen auf der Home-Seite</h1>
            <p className="home-subtitle">Baue dein eigenes Deck und versuche es im Duell gegen einen anderen Spieler oder gegen unseren Bot!.</p>
            <p className="home-subtitle">Logge dich ein und leg los.</p>

            <div className="home-actions">
                <Link className="home-btn" to="/login">Einloggen</Link>
                <Link className="home-btn secondary" to="/registration">Registrieren</Link>
            </div>
        </div>
    );
}

export default Home;
