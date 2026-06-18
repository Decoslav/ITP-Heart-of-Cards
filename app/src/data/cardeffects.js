export function createRuntimeUnit(card) {
  return {
    ...card,
    currentHp: card.hp,
    maxHp: card.hp,
    baseAtk: card.atk,
    currentAtk: card.atk,
    roundsOnField: 0,     //für Bowser, Ice-Witch
    hasBeenHit: false,    // für Ice-Golem
    hasRevived: false,    // für Phoenix
  };
}

const CARD_EFFECTS = {
  // ------------------Tanks ----------------------------
  "King Slime": {
    onRoundStart(unit) {
      unit.currentHp += 1;
      unit.maxHp += 1;
    },
  },

  Stronghold: {
    onRoundStart(unit) {
      unit.currentAtk += 1;
    },
  },

  "Ice-Golem": {
    modifyIncomingDamage(unit, incomingDamage) {
      if (unit.hasBeenHit) return incomingDamage;
      unit.hasBeenHit = true;
      return Math.floor(incomingDamage / 2);
    },
  },

  // ------------------Damage ----------------------------
  Sultan: {
    modifyOutgoingDamage(unit, baseDamage) {
      return baseDamage * 2;
    },
    modifyIncomingDamage(unit, incomingDamage) {
      return incomingDamage * 2;
    },
  },

  "Shadow-Ninja": {
    canAttackPlayerDirectly() {
      return true;
    },
  },

  // ------------------Hybrid ----------------------------
  Phoenix: {
    onLethalDamage(unit) {
      if (unit.hasRevived) return true;
      unit.hasRevived = true;
      unit.currentHp = 10;
      return false;
    },
  },

  Bowser: {
    onRoundStart(unit) {
      unit.roundsOnField += 1;
    },
    modifyOutgoingDamage(unit, baseDamage) {
      return unit.roundsOnField <= 1 ? baseDamage * 2 : baseDamage;
    },
  },

  "Ice-Witch": {
    onRoundStart(unit) {
      unit.roundsOnField += 1;
    },
    modifyOutgoingDamage(unit, baseDamage) {
      return unit.roundsOnField <= 1 ? Math.floor(baseDamage / 2) : baseDamage;
    },
  },
};