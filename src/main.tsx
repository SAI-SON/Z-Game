import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import './index.css';
import App from './App.tsx';
import { auth, isFirebaseConfigured } from './firebase/config';
import { useAuthStore } from './store/authStore';
import { userService } from './services/userService';

const AUTH_TIMEOUT_MS = 8000;

const root = createRoot(document.getElementById('root')!);

function startAuthListener(): void {
  if (!isFirebaseConfigured || !auth) {
    useAuthStore.getState().setLoading(false);
    return;
  }

  const { setFirebaseUser, setUser, setLoading } = useAuthStore.getState();
  setLoading(true);

  let initialResolved = false;

  const resolveInitial = () => {
    if (!initialResolved) {
      initialResolved = true;
      setLoading(false);
    }
  };

  const timeoutId = window.setTimeout(() => {
    console.warn('[Z Game] Auth initialization timed out — showing app anyway.');
    resolveInitial();
  }, AUTH_TIMEOUT_MS);

  onAuthStateChanged(
    auth,
    async (firebaseUser: FirebaseUser | null) => {
      setFirebaseUser(firebaseUser);
      try {
        if (firebaseUser) {
          const profile = await userService.getUserDoc(firebaseUser.uid);
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        setUser(null);
      } finally {
        window.clearTimeout(timeoutId);
        resolveInitial();
      }
    },
    (error) => {
      console.error('Auth state listener error:', error);
      window.clearTimeout(timeoutId);
      resolveInitial();
    },
  );
}

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);

startAuthListener();
