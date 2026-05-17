import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { listenToGameState } from '../services/gameService';
import { listenToRoom } from '../services/roomService';
import type { GameState, Room } from '../types';
import { NeonButton } from '../components/ui/NeonButton';

export default function GamePage() {
  const { roomCode = '' } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const code = roomCode.toUpperCase();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (!code) return;
    const unsubGame = listenToGameState(code, setGameState);
    const unsubRoom = listenToRoom(code, setRoom);
    return () => {
      unsubGame();
      unsubRoom();
    };
  }, [code]);

  const statusLabel = gameState?.status ?? 'loading';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center"
    >
      <motion.div className="text-6xl font-black text-neon-cyan glow-cyan mb-4">Z</motion.div>
      <h1 className="text-2xl font-bold text-white mb-2">Room {code}</h1>
      <p className="text-neon-cyan/70 mb-2 capitalize">Status: {statusLabel}</p>
      {gameState?.status === 'countdown' && (
        <p className="text-neon-purple animate-pulse mb-6">Game starting...</p>
      )}
      {gameState?.status === 'playing' && (
        <p className="text-white/60 mb-6 max-w-md">
          Full gameplay UI (HUD, player table, hand, Z button) ships in Phase 5.
          Direction: {gameState.currentDirection}
        </p>
      )}
      {room && (
        <p className="text-sm text-white/40 mb-8">
          {Object.keys(room.players).length} players in match
        </p>
      )}
      <NeonButton variant="secondary" onClick={() => navigate('/')}>
        Back to Home
      </NeonButton>
    </motion.div>
  );
}
