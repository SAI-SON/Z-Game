import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonButton } from './ui/NeonButton';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/userService';

const AVATARS = [
  '🐉',
  '🐯',
  '💀',
  '🔥',
  '🥷',
  '⭐',
  '🌙',
  '⚡',
  '💎',
  '⚔️',
  '🛡️',
  '🦅',
  '🦊',
  '🐺',
  '🦂',
  '🧠',
  '🧪',
  '🚀',
  '🎮',
  '👑',
];

interface UsernameModalProps {
  isOpen: boolean;
  onSubmit: (username: string, avatar: string) => Promise<void>;
  onClose?: () => void;
}

export function UsernameModal({ isOpen, onSubmit, onClose }: UsernameModalProps) {
  const firebaseUser = useAuthStore((state) => state.firebaseUser);
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidUsername = username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);

  const handleSubmit = async () => {
    if (!isValidUsername) {
      setError('Username must be 3-20 alphanumeric characters (and underscores)');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const isAvailable = await userService.checkUsernameAvailability(username, firebaseUser?.uid);
      if (!isAvailable) {
        throw new Error('Username is already taken');
      }
      await onSubmit(username, selectedAvatar);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="glass-lg p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-neon-cyan glow-cyan mb-6 text-center">Create Profile</h2>

            {/* Username Input */}
            <div className="mb-6">
              <label className="block text-neon-cyan text-sm font-semibold mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                placeholder="Enter username"
                maxLength={20}
                className="w-full bg-white/5 border border-neon-cyan/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-neon-cyan focus:shadow-glow-cyan"
              />
              <p className="text-xs text-neon-cyan/60 mt-1">{username.length}/20 characters</p>
            </div>

            {/* Avatar Picker */}
            <div className="mb-6">
              <label className="block text-neon-cyan text-sm font-semibold mb-3">Choose Avatar</label>
              <div className="grid grid-cols-5 gap-2">
                {AVATARS.map((avatar) => (
                  <motion.button
                    key={avatar}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`text-3xl p-2 rounded-lg transition-all ${
                      selectedAvatar === avatar
                        ? 'glow-border-cyan bg-neon-cyan/20'
                        : 'border border-white/10 hover:border-neon-cyan/50'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {avatar}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && <p className="text-neon-pink text-sm mb-4 text-center">{error}</p>}

            {/* Submit Button */}
            <NeonButton
              onClick={handleSubmit}
              disabled={!isValidUsername || loading}
              loading={loading}
              className="w-full"
            >
              Create Profile
            </NeonButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
