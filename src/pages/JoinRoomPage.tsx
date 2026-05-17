import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NeonButton } from '../components/ui/NeonButton';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuthStore } from '../store/authStore';
import { joinRoom, RoomServiceError } from '../services/roomService';
import { getRecentRooms, saveRecentRoom } from '../utils/roomStorage';

const CODE_LENGTH = 6;

export default function JoinRoomPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const [chars, setChars] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentRooms, setRecentRooms] = useState(getRecentRooms());
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const roomCode = chars.join('');

  useEffect(() => {
    const fromUrl = searchParams.get('code')?.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);
    if (fromUrl && fromUrl.length === CODE_LENGTH) {
      setChars(fromUrl.split(''));
    }
    inputRefs.current[0]?.focus();
  }, [searchParams]);

  const setCharAt = (index: number, value: string) => {
    const char = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1);
    const next = [...chars];
    next[index] = char;
    setChars(next);
    setError(null);
    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !chars[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && roomCode.length === CODE_LENGTH) {
      void handleJoin();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, CODE_LENGTH);
    const next = Array(CODE_LENGTH).fill('');
    pasted.split('').forEach((c, i) => {
      next[i] = c;
    });
    setChars(next);
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const errorMessage = (code: RoomServiceError['code']) => {
    switch (code) {
      case 'NOT_FOUND':
        return 'Room not found';
      case 'FULL':
        return 'Room is full';
      case 'IN_PROGRESS':
        return 'Game in progress';
      default:
        return 'Unable to join room';
    }
  };

  const handleJoin = async (codeOverride?: string) => {
    if (!user) return;
    const code = (codeOverride ?? roomCode).toUpperCase();
    if (code.length !== CODE_LENGTH) {
      setError('Enter a 6-character room code');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await joinRoom(code, user);
      saveRecentRoom(code);
      setRecentRooms(getRecentRooms());
      navigate(`/room/${code}/lobby`);
    } catch (err) {
      if (err instanceof RoomServiceError) {
        setError(errorMessage(err.code));
      } else {
        setError(err instanceof Error ? err.message : 'Failed to join room');
      }
    } finally {
      setLoading(false);
    }
  };

  const quickJoin = async (code: string) => {
    setChars(code.split('').concat(Array(CODE_LENGTH).fill('')).slice(0, CODE_LENGTH));
    await handleJoin(code);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto px-4 py-10"
    >
      <GlassCard glowColor="purple" className="p-6 md:p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-8">Join Room</h1>

        <div className="flex justify-center gap-2 mb-8" onPaste={handlePaste}>
          {chars.map((char, i) => (
            <motion.input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="text"
              maxLength={1}
              value={char}
              onChange={(e) => setCharAt(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-mono font-bold rounded-lg bg-white/5 border border-white/20 text-neon-cyan focus:border-neon-cyan focus:glow-border-cyan outline-none uppercase"
              aria-label={`Room code character ${i + 1}`}
            />
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ x: 0 }}
            animate={{ x: [-10, 10, -10, 10, 0] }}
            className="text-red-400 text-sm mb-4 glow-pink"
          >
            {error}
          </motion.p>
        )}

        <NeonButton
          variant="primary"
          size="lg"
          className="w-full mb-10"
          loading={loading}
          disabled={roomCode.length !== CODE_LENGTH}
          onClick={() => handleJoin()}
        >
          Join Room
        </NeonButton>

        {recentRooms.length > 0 && (
          <div className="text-left">
            <h2 className="text-sm font-semibold text-neon-cyan/80 mb-3">Recent Rooms</h2>
            <div className="space-y-2">
              {recentRooms.map((room) => (
                <motion.div
                  key={room.roomCode}
                  layout
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <span className="font-mono text-neon-cyan tracking-widest">{room.roomCode}</span>
                  <NeonButton
                    variant="secondary"
                    size="sm"
                    onClick={() => quickJoin(room.roomCode)}
                    loading={loading}
                  >
                    Join
                  </NeonButton>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
