import type { Card, PowerCard, PowerCardType } from '../types';

export const CARD_TYPES = [
  { type: 'dragon', emoji: '🐉', color: '#FF4444' },
  { type: 'tiger', emoji: '🐯', color: '#FF8800' },
  { type: 'skull', emoji: '💀', color: '#888888' },
  { type: 'fire', emoji: '🔥', color: '#FF6600' },
  { type: 'ninja', emoji: '🥷', color: '#333333' },
  { type: 'star', emoji: '⭐', color: '#FFDD00' },
  { type: 'moon', emoji: '🌙', color: '#6688FF' },
  { type: 'bolt', emoji: '⚡', color: '#FFEE00' },
  { type: 'gem', emoji: '💎', color: '#00FFFF' },
  { type: 'sword', emoji: '⚔️', color: '#CCCCCC' },
  { type: 'ghost', emoji: '👻', color: '#AADDFF' },
  { type: 'bomb', emoji: '💣', color: '#222222' },
  { type: 'crown', emoji: '👑', color: '#FFD700' },
  { type: 'wolf', emoji: '🐺', color: '#7788AA' },
  { type: 'snake', emoji: '🐍', color: '#44BB44' },
  { type: 'ice', emoji: '🧊', color: '#88DDFF' },
  { type: 'vortex', emoji: '🌀', color: '#9955FF' },
  { type: 'eye', emoji: '👁️', color: '#FF55AA' },
  { type: 'anchor', emoji: '⚓', color: '#336688' },
  { type: 'phoenix', emoji: '🦅', color: '#FF7722' },
] as const;

const POWER_TYPES: PowerCardType[] = [
  'reverse',
  'shuffle',
  'freeze',
  'skip',
  'double',
  'hidden',
  'speed',
];

let cardIdCounter = 0;

function nextCardId(): string {
  cardIdCounter += 1;
  return `card_${Date.now()}_${cardIdCounter}`;
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pickRandomTypes(count: number): typeof CARD_TYPES[number][] {
  const pool = shuffle([...CARD_TYPES]);
  return pool.slice(0, count);
}

function createCard(typeDef: (typeof CARD_TYPES)[number], power?: PowerCardType): Card | PowerCard {
  const base = {
    id: nextCardId(),
    type: typeDef.type,
    emoji: typeDef.emoji,
    color: typeDef.color,
  };
  if (power) {
    return { ...base, power };
  }
  return base;
}

export function buildDeck(
  playerCount: number,
  cardsPerPlayer: number,
  powerCardsEnabled: boolean,
): Card[] {
  const selectedTypes = pickRandomTypes(playerCount);
  const deck: Card[] = [];

  for (const typeDef of selectedTypes) {
    for (let i = 0; i < cardsPerPlayer; i++) {
      deck.push(createCard(typeDef));
    }
  }

  if (powerCardsEnabled && deck.length > 0) {
    const powerSlots = Math.min(playerCount, deck.length);
    for (let p = 0; p < powerSlots; p++) {
      const index = Math.floor(Math.random() * deck.length);
      const power = POWER_TYPES[Math.floor(Math.random() * POWER_TYPES.length)];
      const typeDef = CARD_TYPES.find((t) => t.type === deck[index].type) ?? CARD_TYPES[0];
      deck[index] = createCard(typeDef, power) as PowerCard;
    }
  }

  return shuffle(deck);
}

export function dealCards(deck: Card[], playerUids: string[]): Record<string, Card[]> {
  const hands: Record<string, Card[]> = {};
  playerUids.forEach((uid) => {
    hands[uid] = [];
  });

  playerUids.forEach((uid, index) => {
    const cardsPerPlayer = Math.floor(deck.length / playerUids.length);
    const start = index * cardsPerPlayer;
    hands[uid] = deck.slice(start, start + cardsPerPlayer);
  });

  return hands;
}

export function checkWinCondition(cards: Card[]): boolean {
  if (cards.length < 2) return false;
  const firstType = cards[0].type;
  return cards.every((c) => c.type === firstType);
}

export function getPassTarget(
  players: string[],
  currentUid: string,
  direction: 'left' | 'right',
): string {
  const index = players.indexOf(currentUid);
  if (index === -1) return players[0];
  const offset = direction === 'right' ? 1 : -1;
  const nextIndex = (index + offset + players.length) % players.length;
  return players[nextIndex];
}

export function resolveInitialDirection(
  directionMode: import('../types').DirectionMode,
): 'left' | 'right' {
  switch (directionMode) {
    case 'single-left':
      return 'left';
    case 'single-right':
    case 'random':
    case 'reverse':
    default:
      return 'right';
  }
}
