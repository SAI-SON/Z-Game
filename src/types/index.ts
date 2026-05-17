export interface User {
  uid: string;
  username: string;
  avatar: string; // emoji or URL
  rank: RankTier;
  coins: number;
  totalWins: number;
  totalMatches: number;
  winRate: number;
}

export type RankTier =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'legend';

export type DirectionMode = 'single-right' | 'single-left' | 'random' | 'reverse';

export type GameSpeed = 'normal' | 'fast' | 'crazy';

export type GameMode = 'classic' | 'crazy' | 'dark' | 'survival' | 'chaos';

export interface Card {
  id: string;
  type: string; // 'dragon', 'tiger', 'skull', etc.
  emoji: string;
  color: string;
}

export interface Player {
  uid: string;
  username: string;
  avatar: string;
  cards: Card[];
  score: number;
  isReady: boolean;
  isHost: boolean;
  isConnected: boolean;
  lastActive: number;
}

export interface Room {
  roomCode: string;
  hostUid: string;
  status: 'lobby' | 'playing' | 'finished';
  settings: RoomSettings;
  players: Record<string, Player>;
  createdAt: number;
}

export interface RoomSettings {
  maxPlayers: number;
  cardsPerPlayer: number;
  directionMode: DirectionMode;
  gameMode: GameMode;
  gameSpeed: GameSpeed;
  powerCardsEnabled: boolean;
  isPublic: boolean;
  matchDurationSeconds: number;
}

export interface GameState {
  roomCode: string;
  status: 'waiting' | 'countdown' | 'playing' | 'buzzer' | 'finished';
  currentDirection: 'left' | 'right';
  roundStartTime: number;
  passCycleIndex: number;
  zPressedBy: string | null;
  zPressTime: number | null;
  buzzers: Record<string, number>; // uid -> timestamp
  winnerUid: string | null;
}

export type PowerCardType = 'reverse' | 'shuffle' | 'freeze' | 'skip' | 'double' | 'hidden' | 'speed';

export interface PowerCard extends Card {
  power: PowerCardType;
}

export interface ChatMessage {
  id: string;
  uid: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: number;
}

export interface RecentRoom {
  roomCode: string;
  joinedAt: number;
}
