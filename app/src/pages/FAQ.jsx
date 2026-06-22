import './FAQ.css';

const FAQ_ITEMS = [
  {
    question: 'Was ist Heart of Cards?',
    answer: 'Heart of Cards ist ein Kartenspiel-Projekt, mit dem du eigene Decks zusammenstellen und in einem Duellmodus gegen einen Freund oder gegen einen Bot antreten kannst.',
  },
  {
    question: 'Wie baue ich ein eigenes Deck?',
    answer: 'Im Deckbuilder kannst du aus dem Kartenpool wählen und deine Karten zu einem eigenen Deck zusammenstellen. Gespeicherte Decks stehen dir danach im Duellraum zur Auswahl.',
  },
  {
    question: 'Was ist der Unterschied zwischen "Gegeneinander" und "Gegen BOT"?',
    answer: 'Bei "Gegeneinander" spielen zwei Spieler abwechselnd am selben Gerät, wobei beim Zugwechsel ein Sichtschutz-Bildschirm die Hand des anderen Spielers verdeckt. Bei "Gegen BOT" spielst du allein gegen einen Computergegner mit einem zufällig gewählten Deck.',
  },
  {
    question: 'Wie laufe ich einen Zug ab?',
    answer: 'Du ziehst eine Karte von deinem Stapel, spielst Karten von deiner Hand auf dein Spielfeld und kannst mit Kreaturen, die noch nicht angegriffen haben, den Gegner oder seine Karten angreifen. Mit "Zug beenden" übergibst du an den nächsten Spieler.',
  },
  {
    question: 'Wie greife ich an?',
    answer: 'Klicke zuerst auf eine eigene Karte auf dem Spielfeld, um sie als Angreifer auszuwählen. Danach klickst du auf eine gegnerische Karte oder die gegnerischen Lebenspunkte, um den Angriff auszuführen. Zauberkarten können nicht direkt angreifen.',
  },
];

function FAQPage() {
  return (
    <div className="faq-page">
      <div className="faq-container">
        <p className="faq-kicker">Hilfe &amp; Antworten</p>
        <h1>Häufig gestellte Fragen</h1>
        <p className="faq-subtitle">
          Hier findest du Antworten zu Decks, Duellen und den Grundlagen von Heart of Cards.
        </p>

        <div className="faq-list">
          {FAQ_ITEMS.map((item, index) => (
            <details key={index} className="faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FAQPage;
