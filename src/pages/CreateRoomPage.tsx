import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NeonButton } from '../components/ui/NeonButton';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuthStore } from '../store/authStore';
import { createRoom } from '../services/roomService';
import type { DirectionMode, GameMode, GameSpeed, RoomSettings } from '../types';

const DEFAULT_SETTINGS: RoomSettings = {
  maxPlayers: 4,
  cardsPerPlayer: 5,
  directionMode: 'single-right',
  gameMode: 'classic',
  gameSpeed: 'normal',
  powerCardsEnabled: false,
  isPublic: true,
  matchDurationSeconds: 180,
};

const DIRECTION_OPTIONS: { value: DirectionMode; icon: string; label: string }[] = [
  { value: 'single-right', icon: '→', label: 'Single Right' },
  { value: 'single-left', icon: '←', label: 'Single Left' },
  { value: 'random', icon: '↔', label: 'Random' },
  { value: 'reverse', icon: '↩', label: 'Reverse' },
];

const GAME_MODE_OPTIONS: { value: GameMode; label: string }[] = [
  { value: 'classic', label: 'Classic' },
  { value: 'crazy', label: 'Crazy' },
  { value: 'dark', label: 'Dark' },
  { value: 'survival', label: 'Survival' },
  { value: 'chaos', label: 'Chaos' },
];

const SPEED_OPTIONS: { value: GameSpeed; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Fast' },
  { value: 'crazy', label: 'Crazy' },
];

interface OptionCardProps {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}

function OptionCard({ selected, onSelect, children }: OptionCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`p-3 rounded-xl text-sm font-medium transition-all border ${
        selected
          ? 'border-neon-cyan glow-border-cyan text-neon-cyan bg-neon-cyan/10'
          : 'border-white/10 text-white/70 bg-white/5 hover:border-white/20'
      }`}
    >
      {children}
    </motion.button>
  );
}

export default function CreateRoomPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [settings, setSettings] = useState<RoomSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (partial: Partial<RoomSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const roomCode = await createRoom(user, settings);
      navigate(`/room/${roomCode}/lobby`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto px-4 py-10"
    >
      <GlassCard glowColor="cyan" className="p-6 md:p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Create Room</h1>
        <div className="h-0.5 w-24 bg-gradient-to-r from-neon-cyan to-neon-purple mb-8 rounded-full" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div>
            <label className="text-sm text-neon-cyan/80 mb-2 block">
              Max Players: {settings.maxPlayers}
            </label>
            <input
              type="range"
              min={2}
              max={10}
              value={settings.maxPlayers}
              onChange={(e) => patch({ maxPlayers: Number(e.target.value) })}
              className="w-full accent-neon-cyan"
            />
          </div>

          <motion.div>
            <label className="text-sm text-neon-cyan/80 mb-2 block">
              Cards Per Player: {settings.cardsPerPlayer}
            </label>
            <input
              type="range"
              min={3}
              max={8}
              value={settings.cardsPerPlayer}
              onChange={(e) => patch({ cardsPerPlayer: Number(e.target.value) })}
              className="w-full accent-neon-cyan"
            />
          </motion.div>

          <motion.div>
            <p className="text-sm text-neon-cyan/80 mb-2">Direction Mode</p>
            <motion.div className="grid grid-cols-2 gap-2">
              {DIRECTION_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={settings.directionMode === opt.value}
                  onSelect={() => patch({ directionMode: opt.value })}
                >
                  <span className="text-lg block mb-1">{opt.icon}</span>
                  {opt.label}
                </OptionCard>
              ))}
            </motion.div>
          </motion.div>

          <motion.div>
            <p className="text-sm text-neon-cyan/80 mb-2">Game Mode</p>
            <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GAME_MODE_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={settings.gameMode === opt.value}
                  onSelect={() => patch({ gameMode: opt.value })}
                >
                  {opt.label}
                </OptionCard>
              ))}
            </motion.div>
          </motion.div>

          <motion.div>
            <p className="text-sm text-neon-cyan/80 mb-2">Speed</p>
            <motion.div className="grid grid-cols-3 gap-2">
              {SPEED_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={settings.gameSpeed === opt.value}
                  onSelect={() => patch({ gameSpeed: opt.value })}
                >
                  {opt.label}
                </OptionCard>
              ))}
            </motion.div>
          </motion.div>

          <div>
            <label className="text-sm text-neon-cyan/80 mb-2 block">
              Match Duration: {settings.matchDurationSeconds}s
            </label>
            <input
              type="range"
              min={60}
              max={300}
              step={30}
              value={settings.matchDurationSeconds}
              onChange={(e) => patch({ matchDurationSeconds: Number(e.target.value) })}
              className="w-full accent-neon-cyan"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white/80">Power Cards</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.powerCardsEnabled}
              onClick={() => patch({ powerCardsEnabled: !settings.powerCardsEnabled })}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.powerCardsEnabled ? 'bg-neon-cyan' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${
                  settings.powerCardsEnabled ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white/80">Room Visibility</span>
            <div className="flex gap-2">
              {(['Public', 'Private'] as const).map((label) => {
                const isPublic = label === 'Public';
                const selected = settings.isPublic === isPublic;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => patch({ isPublic })}
                    className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                      selected
                        ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10'
                        : 'border-white/10 text-white/60'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ x: 0 }}
              animate={{ x: [-8, 8, -8, 8, 0] }}
              className="text-neon-pink text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <NeonButton
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
            onClick={handleCreate}
          >
            Create Room
          </NeonButton>
        </motion.div>
      </GlassCard>
    </motion.div>
  );
}
