import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './index.css';

const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const HomePage = React.lazy(() => import('./pages/HomePage'));
const CreateRoomPage = React.lazy(() => import('./pages/CreateRoomPage'));
const JoinRoomPage = React.lazy(() => import('./pages/JoinRoomPage'));
const LobbyPage = React.lazy(() => import('./pages/LobbyPage'));
const GamePage = React.lazy(() => import('./pages/GamePage'));
import ProtectedLayout from './components/ProtectedLayout';

const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-dark-bg flex items-center justify-center">
    <div className="text-center">
      <motion.div className="text-5xl font-bold text-neon-cyan glow-cyan mb-4 animate-pulse">
        Z
      </motion.div>
      <p className="text-neon-cyan/60">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/create-room" element={<CreateRoomPage />} />
            <Route path="/join-room" element={<JoinRoomPage />} />
            <Route path="/room/:roomCode/lobby" element={<LobbyPage />} />
            <Route path="/room/:roomCode/game" element={<GamePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;
