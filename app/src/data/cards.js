export const ALL_CARDS = [
  // TANKS
  { name: "Knight",       hp: 60, atk: 4,  imageUrl: "/images/Knight.png",      type: "tank",   description: "A knight with a lionheart." },
  { name: "Ice-Golem",    hp: 50, atk: 4,  imageUrl: "/images/IceGolem.png",    type: "tank",   description: "This golem was born in the first ice age." },
  { name: "Sea-Guardian", hp: 40, atk: 6,  imageUrl: "/images/SeaGuardian.png", type: "tank",   description: "The guardian of Atlantis." },
  { name: "Ender-Dragon", hp: 50, atk: 5,  imageUrl: "/images/EnderDragon.png", type: "tank",   description: "Ender of all dragons." },
  { name: "King Slime",   hp: 64, atk: 2,  imageUrl: "/images/king_slime.png",  type: "tank",   description: "It ate enough material to become the king of all slimes." },
  { name: "Stronghold",   hp: 45, atk: 5,  imageUrl: "/images/stronghold.png",  type: "tank",   description: "Created by a mad alchemist, it protects the kingdom from all enemies." },
  { name: "Djinn",        hp: 50, atk: 5,  imageUrl: "/images/djinn.png",       type: "tank",   description: "Three wishes are granted for freeing the djinn from his prison." },

  // DAMAGE
  { name: "Bone-Warrior", hp: 10, atk: 20, imageUrl: "/images/BoneWarrior.png", type: "damage", description: "He forgot to die and keeps fighting." },
  { name: "Ice-Mage",     hp: 8,  atk: 22, imageUrl: "./images/IceMage.png",     type: "damage", description: "Absolute zero not only in theory." },
  { name: "Goblin",       hp: 20, atk: 10, imageUrl: "/images/Goblin.png",      type: "damage", description: "An anomaly of the goblin kin, they don't read." },
  { name: "Shadow-Ninja", hp: 12, atk: 18, imageUrl: "/images/ShadowNinja.png", type: "damage", description: "Mid gap." },
  { name: "Summoner",     hp: 15, atk: 15, imageUrl: "/images/Summoner.png",    type: "damage", description: "Never alone." },
  { name: "Sultan",       hp: 14, atk: 16, imageUrl: "/images/sultan.png",      type: "damage", description: "He spins to win his fights." },

  // HYBRID
  { name: "Fire-Dragon",  hp: 25, atk: 8,  imageUrl: "/images/FireDragon.png",  type: "hybrid", description: "A dragon that burns all his enemies." },
  { name: "Ice-Witch",    hp: 20, atk: 5,  imageUrl: "/images/IceWitch.png",    type: "hybrid", description: "Ice cold spells and an ice cold heart." },
  { name: "Gnome",        hp: 30, atk: 4,  imageUrl: "/images/Gnome.png",       type: "hybrid", description: "After 1000 years he learned to control lightning." },
  { name: "Thunderbird",  hp: 22, atk: 12, imageUrl: "/images/ThunderBird.png", type: "hybrid", description: "In the east they call her 'Taifun', in the west 'Hurricane' and in the south 'Cyclone'." },
  { name: "Phoenix",      hp: 20, atk: 12, imageUrl: "/images/Phoenix.png",     type: "hybrid", description: "Phoenix never dies." },
  { name: "Bowser",       hp: 30, atk: 7,  imageUrl: "/images/Bowser.png",      type: "hybrid", description: "His name is 'Cupcake' and he doesn't bite." },
  { name: "Dragon Monk",  hp: 24, atk: 10, imageUrl: "/images/dragon_monk.png", type: "hybrid", description: "After training Kung Fu everyday he mastered the dragon fist." },

  // SPELLS (NEU!)
  { name: "Holy Heal",    hp: 0,  atk: 5,  imageUrl: "/images/HolyHeal.png",    type: "spell",  description: "Heals all your units on the board.", effect: "heal_all" },
  { name: "Fireball",     hp: 0,  atk: 12,  imageUrl: "/images/Fireball.png",    type: "spell",  description: "Deals 12 damage to one enemy unit.", effect: "damage_single" }
];

export const PRESET_DECKS = [
  {
    id: 'firestorm',
    name: 'Feuersturm',
    description: 'Schnell, aggressiv und auf hohen Schaden ausgelegt.',
    cards: ['Fire-Dragon', 'Phoenix', 'Bone-Warrior', 'Goblin', 'Summoner', 'Shadow-Ninja', 'Bowser', 'Ice-Mage'],
  },
  {
    id: 'frostguard',
    name: 'Frostwache',
    description: 'Viel Leben, stabile Frontline und sichere Kontrolle.',
    cards: ['Knight', 'Ice-Golem', 'Sea-Guardian', 'Ice-Witch', 'Ice-Mage', 'Gnome', 'Thunderbird', 'Summoner'],
  },
  {
    id: 'shadow',
    name: 'Schattenpakt',
    description: 'Flexibel, mystisch und mit starken Hybrid-Karten.',
    cards: ['Ender-Dragon', 'Shadow-Ninja', 'Summoner', 'Ice-Witch', 'Fire-Dragon', 'Bowser', 'Phoenix', 'Gnome'],
  },
];

export function mapCardNamesToCards(cardNames) {
  return cardNames
    .map((name) => ALL_CARDS.find((card) => card.name === name))
    .filter(Boolean);
}

export function hydrateSavedCards(cardsFromApi) {
  return cardsFromApi
    .map((apiCard) => {
      const localCard = ALL_CARDS.find((card) => card.name === apiCard.name);
      return localCard ?? {
        name: apiCard.name,
        hp: apiCard.hp,
        atk: apiCard.atk,
        imageUrl: "",
        type: "saved",
        description: "Gespeicherte Karte.",
      };
    })
    .filter(Boolean);
}