import './Card.css';

function Card({ name, hp, atk, imageUrl, onCardClick }) {
  return (
    <div className="game-card" onClick={onCardClick}>
      <div className="card-header">
        <span className="card-name">{name}</span>
        <span className="hp-badge">{hp} HP</span>
      </div>

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