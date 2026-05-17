import type { RecentRoom } from '../types';

const RECENT_ROOMS_KEY = 'zgame-recent-rooms';
const MAX_RECENT = 3;

export function getRecentRooms(): RecentRoom[] {
  try {
    const raw = localStorage.getItem(RECENT_ROOMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentRoom[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function saveRecentRoom(roomCode: string): void {
  const existing = getRecentRooms().filter((r) => r.roomCode !== roomCode);
  const updated: RecentRoom[] = [
    { roomCode, joinedAt: Date.now() },
    ...existing,
  ].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(updated));
}
