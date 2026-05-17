import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { NeonButton } from './ui/NeonButton';
import { RankBadge } from './ui/RankBadge';
import { UserAvatar } from './ui/UserAvatar';

export function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-dark-bg/80 backdrop-blur-md border-b border-neon-cyan/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="text-2xl font-bold text-neon-cyan glow-cyan">Z</div>
            <div className="hidden sm:block text-xl font-bold text-white">Game</div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-neon-cyan/80 hover:text-neon-cyan transition">
              Home
            </a>
            <a href="#" className="text-neon-cyan/80 hover:text-neon-cyan transition">
              Leaderboard
            </a>
            <a href="#" className="text-neon-cyan/80 hover:text-neon-cyan transition">
              Profile
            </a>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="text-sm text-right">
                  <p className="font-semibold text-white">{user.username}</p>
                  <p className="text-neon-cyan/60 text-xs">{user.coins} coins</p>
                </div>
                <UserAvatar avatar={user.avatar} size="sm" />
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-neon-cyan/20 bg-dark-bg/95"
            >
              <div className="px-4 py-4 space-y-4">
                {user && (
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                    <UserAvatar avatar={user.avatar} size="md" />
                    <div>
                      <p className="font-semibold text-white">{user.username}</p>
                      <RankBadge rank={user.rank} />
                    </div>
                  </div>
                )}
                <a href="#" className="block text-neon-cyan/80 hover:text-neon-cyan">
                  Home
                </a>
                <a href="#" className="block text-neon-cyan/80 hover:text-neon-cyan">
                  Leaderboard
                </a>
                <a href="#" className="block text-neon-cyan/80 hover:text-neon-cyan">
                  Profile
                </a>
                <NeonButton
                  variant="danger"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full"
                >
                  Sign Out
                </NeonButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
