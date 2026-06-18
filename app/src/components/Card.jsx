import './Card.css';

function Card({ name, hp, atk, imageUrl, description, type, onCardClick }) {
  const isSpell = type === 'spell';
  const isTank = type === 'tank';

  return (
    <div className={`game-card ${isSpell ? 'type-spell' : ''} ${isTank ? 'type-tank' : ''}`} onClick={onCardClick}>
      <div className="card-header">
        <span className="card-name">{name}</span>
        {/* Zeigt das Spell-Badge oder die HP der Unit */}
        {isSpell ? (
          <span className="spell-badge">✨ SPELL</span>
        ) : (
          <span className="hp-badge">{hp} HP</span>
        )}
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
          {description ?? "Eine mächtige Karte für dein Duell."}
        </p>
      </div>
      
      {/* ATK-Sektion wird bei Spells komplett ausgeblendet */}
      {!isSpell && (
        <div className="card-stats">
          <div className="stat-item">
            <span className="stat-label">ATK</span>
            <span className="stat-value">{atk}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Card;