import { Navigate } from 'react-router-dom';
import { isFirebaseConfigured } from '../firebase/config';
import { useAuthStore } from '../store/authStore';
import { FirebaseSetupScreen } from './FirebaseSetupScreen';

interface AuthGuardProps {
  children: React.ReactNode;
}

function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#050508' }}
    >
      <div className="text-center">
        <div
          className="text-5xl font-bold mb-4 animate-pulse"
          style={{ color: '#00F5FF', textShadow: '0 0 20px rgba(0, 245, 255, 0.8)' }}
        >
          Z
        </div>
        <p style={{ color: 'rgba(0, 245, 255, 0.6)' }}>Loading...</p>
      </div>
    </div>
  );
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { firebaseUser, loading } = useAuthStore();

  if (!isFirebaseConfigured) {
    return <FirebaseSetupScreen />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (!firebaseUser) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
