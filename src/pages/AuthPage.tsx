import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { useAuthStore } from '../store/authStore';
import { auth, isFirebaseConfigured } from '../firebase/config';
import { NeonButton } from '../components/ui/NeonButton';
import { UsernameModal } from '../components/UsernameModal';
import { FirebaseSetupScreen } from '../components/FirebaseSetupScreen';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, setUser, firebaseUser } = useAuthStore();
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (firebaseUser && user && !showUsernameModal) {
      navigate('/', { replace: true });
    }
  }, [firebaseUser, navigate, showUsernameModal, user]);

  if (!isFirebaseConfigured) {
    return <FirebaseSetupScreen />;
  }

  const handleGuestSignIn = async () => {
    setAuthError(null);
    setStatusMessage(null);
    setIsLoading(true);
    try {
      await authService.signInAsGuest();
      setStatusMessage('Choose a username to continue.');
      setShowUsernameModal(true);
    } catch (error) {
      setAuthError(getFirebaseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setStatusMessage(null);
    setIsLoading(true);
    try {
      await authService.signInWithGoogle();
      navigate('/', { replace: true });
    } catch (error) {
      setAuthError(getFirebaseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameSubmit = async (username: string, avatar: string) => {
    const uid = firebaseUser?.uid ?? auth?.currentUser?.uid;
    if (!uid) {
      setAuthError('Session expired. Please tap Play as Guest again.');
      setShowUsernameModal(false);
      return;
    }

    try {
      const profile = await userService.createUserDoc(uid, username, avatar);
      setUser(profile);
      setShowUsernameModal(false);
      setAuthError(null);
      navigate('/', { replace: true });
    } catch (error) {
      const message = getFirebaseErrorMessage(error);
      setAuthError(message);
      throw error;
    }
  };

  const Particle = ({ delay }: { delay: number }) => (
    <motion.div
      initial={{ x: 0, y: 0 }}
      animate={{ x: Math.random() * 100 - 50, y: Math.random() * 100 - 50 }}
      transition={{ duration: 20, delay, repeat: Infinity, repeatType: 'reverse' }}
      className="absolute w-1 h-1 bg-neon-cyan/30 rounded-full pointer-events-none"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  );

  return (
    <div className="min-h-screen bg-dark-bg overflow-hidden relative">
      <motion.div className="absolute inset-0 pointer-events-none" aria-hidden>
        {[...Array(20)].map((_, i) => (
          <Particle key={i} delay={i * 0.2} />
        ))}
      </motion.div>

      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md px-4"
        >
          <div className="text-center mb-12">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block"
            >
              <div className="text-7xl font-bold text-neon-cyan glow-cyan mb-4">Z</div>
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Z GAME</h1>
            <p className="text-neon-cyan/60">The fastest card buzzer game</p>
          </div>

          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-xl border border-neon-pink/50 bg-neon-pink/10 text-neon-pink text-sm"
              role="alert"
            >
              {authError}
            </motion.div>
          )}

          {statusMessage && !authError && (
            <p className="mb-4 text-center text-sm text-neon-cyan">{statusMessage}</p>
          )}

          <div className="space-y-4">
            <NeonButton
              variant="primary"
              size="lg"
              onClick={handleGuestSignIn}
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              Play as Guest
            </NeonButton>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-bg text-neon-cyan/60">or</span>
              </div>
            </div>

            <NeonButton
              variant="secondary"
              size="lg"
              onClick={handleGoogleSignIn}
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              Sign in with Google
            </NeonButton>
          </div>

          <p className="text-center text-neon-cyan/40 text-xs mt-8">
            By playing, you agree to our terms of service
          </p>
        </motion.div>
      </div>

      <UsernameModal
        isOpen={showUsernameModal}
        onSubmit={handleUsernameSubmit}
        onClose={() => setShowUsernameModal(false)}
      />
    </div>
  );
}
