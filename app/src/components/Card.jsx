import './Card.css';

/**
 * Die Card-Komponente für dein 20-Karten-Deck.
 * @param {string} name - Der Name der Karte
 * @param {number} hp - Die Lebenspunkte der Karte
 * @param {number} atk - Die Angriffspunkte der Karte
 * @param {string} imageUrl - Der Pfad zum Bild (z.B. "/Witch.jpg" aus dem public-Ordner)
 */

let currentCards = [];

function Card({ name, hp, atk, imageUrl, onCardClick }) {
  return (

    <div className="game-card" onClick= {onCardClick}>
      {/* Oberer Teil: Name und Lebenspunkte */}
      <div className="card-header">
        <span className="card-name">{name}</span>
        <span className="hp-badge">{hp} HP</span>
      </div>
      {/* Mittlerer Teil: Das Artwork der Karte */}
      <div className="card-image-container">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={`Karte: ${name}`} 
            className="card-art" 
          />
        ) : (
          <div className="card-placeholder">🃏</div>
        )}
      </div>
      
      {/* Unterer Teil: Beschreibung & Stats */}
      <div className="card-body">
        <p className="card-description">
          Eine mächtige Karte für dein Duell.
        </p>
      </div>
      
      <div className="card-stats">
        <div className="stat-item">
          <span className="stat-label">ATK</span>
          <span className="stat-value">{atk}</span>
        </div>
      </div>
    </div>
  );
}

export default Card;