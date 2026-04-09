import './Deck.css';
import Card from '../components/Card';

function DeckPage() {
  return (
    
    <div style={{ display: 'flex', gap: '20px', padding: '40px' }}>
        {/* Hier erstellen wir drei verschiedene Karten mit einer Komponente! */}
        <Card name="Feuerdrache" hp={25} atk={8} imageUrl="🔥" />
        <Card name="Eishexe" hp={20} atk={5} imageUrl="/images/hexe.png" />
        <Card name="Mage" hp={15} atk={10} imageUrl="/images/Mage.png" />
    </div>
  )
}

export default DeckPage;