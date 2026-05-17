import {
  ref,
  get,
  set,
  update,
  remove,
  onValue,
  onDisconnect,
  push,
  type Unsubscribe,
} from 'firebase/database';
import { db, isFirebaseConfigured } from '../firebase/config';

function getDb() {
  if (!db) {
    throw new Error('Firebase is not configured');
  }
  return db;
}
import type { ChatMessage, Player, Room, RoomSettings, User } from '../types';

const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export class RoomServiceError extends Error {
  code: 'NOT_FOUND' | 'FULL' | 'IN_PROGRESS' | 'INVALID';

  constructor(message: string, code: 'NOT_FOUND' | 'FULL' | 'IN_PROGRESS' | 'INVALID') {
    super(message);
    this.name = 'RoomServiceError';
    this.code = code;
  }
}

function roomRef(roomCode: string) {
  return ref(getDb(), `rooms/${roomCode}`);
}

function playerRef(roomCode: string, uid: string) {
  return ref(getDb(), `rooms/${roomCode}/players/${uid}`);
}

function buildPlayer(user: User, isHost: boolean): Player {
  return {
    uid: user.uid,
    username: user.username,
    avatar: user.avatar,
    cards: [],
    score: 0,
    isReady: false,
    isHost,
    isConnected: true,
    lastActive: Date.now(),
  };
}

async function setupPlayerPresence(roomCode: string, uid: string): Promise<void> {
  const database = getDb();
  const connectedRef = ref(database, `rooms/${roomCode}/players/${uid}/isConnected`);
  await set(connectedRef, true);
  onDisconnect(connectedRef).set(false);
  onDisconnect(ref(database, `rooms/${roomCode}/players/${uid}/lastActive`)).set(Date.now());
}

export async function generateRoomCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    const snapshot = await get(roomRef(code));
    if (!snapshot.exists()) {
      return code;
    }
  }
  throw new Error('Failed to generate unique room code');
}

export async function createRoom(hostUser: User, settings: RoomSettings): Promise<string> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured');
  }
  const roomCode = await generateRoomCode();
  const room: Room = {
    roomCode,
    hostUid: hostUser.uid,
    status: 'lobby',
    settings,
    players: {
      [hostUser.uid]: buildPlayer(hostUser, true),
    },
    createdAt: Date.now(),
  };

  await set(roomRef(roomCode), room);
  await setupPlayerPresence(roomCode, hostUser.uid);
  return roomCode;
}

export async function joinRoom(roomCode: string, user: User): Promise<void> {
  const normalized = roomCode.toUpperCase().trim();
  const snapshot = await get(roomRef(normalized));

  if (!snapshot.exists()) {
    throw new RoomServiceError('Room not found', 'NOT_FOUND');
  }

  const room = snapshot.val() as Room;

  if (room.status !== 'lobby') {
    throw new RoomServiceError('Game in progress', 'IN_PROGRESS');
  }

  const playerIds = Object.keys(room.players ?? {});
  if (playerIds.length >= room.settings.maxPlayers) {
    throw new RoomServiceError('Room is full', 'FULL');
  }

  if (room.players[user.uid]) {
    await update(playerRef(normalized, user.uid), {
      isConnected: true,
      lastActive: Date.now(),
    });
    await setupPlayerPresence(normalized, user.uid);
    return;
  }

  await set(playerRef(normalized, user.uid), buildPlayer(user, false));
  await setupPlayerPresence(normalized, user.uid);
}

export async function leaveRoom(roomCode: string, uid: string): Promise<void> {
  const snapshot = await get(roomRef(roomCode));
  if (!snapshot.exists()) return;

  const room = snapshot.val() as Room;
  const players = { ...(room.players ?? {}) };
  delete players[uid];

  const remainingUids = Object.keys(players);
  if (remainingUids.length === 0) {
    await remove(roomRef(roomCode));
    return;
  }

  const updates: Record<string, unknown> = {
    [`rooms/${roomCode}/players/${uid}`]: null,
  };

  if (room.hostUid === uid) {
    const newHostUid = remainingUids[0];
    updates[`rooms/${roomCode}/hostUid`] = newHostUid;
    for (const pid of remainingUids) {
      updates[`rooms/${roomCode}/players/${pid}/isHost`] = pid === newHostUid;
    }
  }

  await update(ref(getDb()), updates);
}

export function listenToRoom(
  roomCode: string,
  callback: (room: Room | null) => void,
): Unsubscribe {
  return onValue(roomRef(roomCode), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as Room) : null);
  });
}

export async function toggleReady(roomCode: string, uid: string, isReady: boolean): Promise<void> {
  await update(playerRef(roomCode, uid), { isReady, lastActive: Date.now() });
}

export async function updateRoomSettings(
  roomCode: string,
  hostUid: string,
  settings: RoomSettings,
): Promise<void> {
  const snapshot = await get(roomRef(roomCode));
  if (!snapshot.exists()) {
    throw new RoomServiceError('Room not found', 'NOT_FOUND');
  }
  const room = snapshot.val() as Room;
  if (room.hostUid !== hostUid) {
    throw new RoomServiceError('Only the host can edit settings', 'INVALID');
  }
  await update(roomRef(roomCode), { settings });
}

export async function sendChatMessage(
  roomCode: string,
  user: User,
  text: string,
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;
  await push(ref(getDb(), `rooms/${roomCode}/chat`), {
    uid: user.uid,
    username: user.username,
    avatar: user.avatar,
    text: trimmed.slice(0, 500),
    timestamp: Date.now(),
  });
}

export function listenToChat(
  roomCode: string,
  callback: (messages: ChatMessage[]) => void,
): Unsubscribe {
  const chatRef = ref(getDb(), `rooms/${roomCode}/chat`);
  return onValue(chatRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val() as Record<string, Omit<ChatMessage, 'id'>>;
    const messages: ChatMessage[] = Object.entries(data)
      .map(([id, msg]) => ({ id, ...msg }))
      .sort((a, b) => a.timestamp - b.timestamp);
    callback(messages);
  });
}

export async function setRoomStatus(
  roomCode: string,
  status: Room['status'],
): Promise<void> {
  await update(roomRef(roomCode), { status });
}
