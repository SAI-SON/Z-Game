import { ref, set, update, onValue, type Unsubscribe } from 'firebase/database';
import { db, isFirebaseConfigured } from '../firebase/config';

function getDb() {
  if (!db) {
    throw new Error('Firebase is not configured');
  }
  return db;
}
import type { GameState, Room } from '../types';
import { buildDeck, dealCards, resolveInitialDirection } from './cardEngine';
import { setRoomStatus } from './roomService';

function gameStateRef(roomCode: string) {
  return ref(getDb(), `rooms/${roomCode}/gameState`);
}

export async function startGame(roomCode: string, room: Room): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured');
  }
  const playerUids = Object.keys(room.players);
  const { settings } = room;

  const deck = buildDeck(
    playerUids.length,
    settings.cardsPerPlayer,
    settings.powerCardsEnabled,
  );
  const hands = dealCards(deck, playerUids);

  const initialDirection = resolveInitialDirection(settings.directionMode);
  const roundStartTime = Date.now() + 3000;

  const gameState: Omit<GameState, 'roomCode'> = {
    status: 'countdown',
    currentDirection: initialDirection,
    roundStartTime,
    passCycleIndex: 0,
    zPressedBy: null,
    zPressTime: null,
    buzzers: {},
    winnerUid: null,
  };

  const updates: Record<string, unknown> = {
    [`rooms/${roomCode}/gameState`]: { ...gameState, roomCode },
    [`rooms/${roomCode}/status`]: 'playing',
  };

  for (const uid of playerUids) {
    updates[`rooms/${roomCode}/players/${uid}/cards`] = hands[uid];
    updates[`rooms/${roomCode}/players/${uid}/isReady`] = false;
  }

  await update(ref(getDb()), updates);

  setTimeout(async () => {
    try {
      await update(gameStateRef(roomCode), { status: 'playing' });
    } catch (error) {
      console.error('Failed to transition game to playing:', error);
    }
  }, 3000);
}

export function listenToGameState(
  roomCode: string,
  callback: (state: GameState | null) => void,
): Unsubscribe {
  return onValue(gameStateRef(roomCode), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as GameState) : null);
  });
}

export async function resetRoomToLobby(roomCode: string): Promise<void> {
  await set(gameStateRef(roomCode), null);
  await setRoomStatus(roomCode, 'lobby');
}
