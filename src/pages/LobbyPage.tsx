import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { NeonButton } from '../components/ui/NeonButton';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuthStore } from '../store/authStore';
import {
  leaveRoom,
  listenToChat,
  listenToRoom,
  sendChatMessage,
  toggleReady,
  updateRoomSettings,
} from '../services/roomService';
import { listenToGameState, startGame } from '../services/gameService';
import { saveRecentRoom } from '../utils/roomStorage';
import type { ChatMessage, DirectionMode, Player, Room, RoomSettings } from '../types';
import { UserAvatar } from '../components/ui/UserAvatar';

const DIRECTION_LABELS: Record<DirectionMode, string> = {
  'single-right': '→ Right',
  'single-left': '← Left',
  random: '↔ Random',
  reverse: '↩ Reverse',
};

function SettingsSummary({ settings }: { settings: RoomSettings }) {
  return (
    <motion.div className="text-sm text-white/70 space-y-1">
      <p>
        {DIRECTION_LABELS[settings.directionMode]} · {settings.gameMode} · {settings.gameSpeed}
      </p>
      <p>
        {settings.maxPlayers} players · {settings.cardsPerPlayer} cards · {settings.matchDurationSeconds}s
      </p>
      {settings.powerCardsEnabled && <p className="text-neon-purple">Power cards enabled</p>}
    </motion.div>
  );
}

function PlayerRow({ player }: { player: Player }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: player.isConnected ? 1 : 0.4, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
    >
      <UserAvatar avatar={player.avatar} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">
          {player.username}
          {player.isHost && <span className="ml-1">👑</span>}
        </p>
        {!player.isConnected && (
          <p className="text-xs text-neon-pink/80">Disconnected</p>
        )}
      </div>
      {player.isReady ? (
        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/40">
          Ready
        </span>
      ) : (
        <span className="text-xs text-white/40">Waiting</span>
      )}
    </motion.div>
  );
}

function EditSettingsModal({
  settings,
  onClose,
  onSave,
}: {
  settings: RoomSettings;
  onClose: () => void;
  onSave: (s: RoomSettings) => void;
}) {
  const [draft, setDraft] = useState(settings);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="glass max-w-md w-full p-6 max-h-[80vh] overflow-y-auto"
      >
        <h3 className="text-lg font-bold text-neon-cyan mb-4">Edit Settings</h3>
        <label className="text-sm text-white/70 block mb-2">
          Max players: {draft.maxPlayers}
        </label>
        <input
          type="range"
          min={2}
          max={10}
          value={draft.maxPlayers}
          onChange={(e) => setDraft({ ...draft, maxPlayers: Number(e.target.value) })}
          className="w-full mb-4 accent-neon-cyan"
        />
        <label className="text-sm text-white/70 block mb-2">
          Cards per player: {draft.cardsPerPlayer}
        </label>
        <input
          type="range"
          min={3}
          max={8}
          value={draft.cardsPerPlayer}
          onChange={(e) => setDraft({ ...draft, cardsPerPlayer: Number(e.target.value) })}
          className="w-full mb-6 accent-neon-cyan"
        />
        <div className="flex gap-2">
          <NeonButton variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </NeonButton>
          <NeonButton variant="primary" className="flex-1" onClick={() => onSave(draft)}>
            Save
          </NeonButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LobbyPage() {
  const { roomCode = '' } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [starting, setStarting] = useState(false);
  const [readyLoading, setReadyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [allReadyCountdown, setAllReadyCountdown] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const code = roomCode.toUpperCase();
  const me = user && room?.players[user.uid];
  const isHost = me?.isHost ?? false;
  const players = room ? Object.values(room.players) : [];
  const readyCount = players.filter((p) => p.isReady).length;
  const allReady =
    players.length >= 2 && players.length > 0 && players.every((p) => p.isReady);
  const canStart = isHost && readyCount >= 2;

  useEffect(() => {
    if (!code || !user) return;
    saveRecentRoom(code);
    const unsubRoom = listenToRoom(code, setRoom);
    const unsubChat = listenToChat(code, setMessages);
    const unsubGame = listenToGameState(code, (state) => {
      if (state?.status === 'countdown' || state?.status === 'playing') {
        navigate(`/room/${code}/game`, { replace: true });
      }
    });

    return () => {
      unsubRoom();
      unsubChat();
      unsubGame();
    };
  }, [code, user, navigate]);

  useEffect(() => {
    if (room?.status === 'playing') {
      navigate(`/room/${code}/game`, { replace: true });
    }
  }, [room?.status, code, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!allReady) {
      setAllReadyCountdown(null);
      return;
    }
    setAllReadyCountdown(3);
    const interval = setInterval(() => {
      setAllReadyCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [allReady, players.length]);

  const handleLeave = async () => {
    if (user) {
      await leaveRoom(code, user.uid);
    }
    navigate('/');
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/join-room?code=${code}`;
    if (navigator.share) {
      await navigator.share({ title: 'Join Z Game', url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleReady = async () => {
    if (!user || !me) return;
    setReadyLoading(true);
    try {
      await toggleReady(code, user.uid, !me.isReady);
    } finally {
      setReadyLoading(false);
    }
  };

  const handleStart = async () => {
    if (!room || !canStart) return;
    setStarting(true);
    setError(null);
    try {
      await startGame(code, room);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
    } finally {
      setStarting(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !chatInput.trim()) return;
    await sendChatMessage(code, user, chatInput);
    setChatInput('');
  };

  const handleSaveSettings = async (settings: RoomSettings) => {
    if (!user) return;
    await updateRoomSettings(code, user.uid, settings);
    setEditOpen(false);
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-neon-cyan animate-pulse text-4xl font-bold">Z</div>
      </div>
    );
  }

  const chatPanel = (
    <GlassCard className="flex flex-col h-full min-h-[280px] p-4">
      <h2 className="text-sm font-semibold text-neon-cyan mb-3">Lobby Chat</h2>
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm"
            >
              <UserAvatar avatar={msg.avatar} size="sm" className="inline-block mr-1 align-middle" />
              <span className="font-medium text-neon-cyan/90">{msg.username}</span>
              <span className="text-white/80">: {msg.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <motion.div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSendChat} className="flex gap-2">
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Say something..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-neon-cyan"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm rounded-lg border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
        >
          Send
        </button>
      </form>
    </GlassCard>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-6 pb-28"
    >
      {allReadyCountdown !== null && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
        >
          <span className="text-8xl font-black text-neon-cyan glow-cyan">{allReadyCountdown}</span>
        </motion.div>
      )}

      {editOpen && room && (
        <EditSettingsModal
          settings={room.settings}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveSettings}
        />
      )}

      <motion.div className="grid lg:grid-cols-3 gap-6">
        <motion.div className="space-y-4">
          <h2 className="text-lg font-bold text-white">
            Players ({players.length}/{room.settings.maxPlayers})
          </h2>
          <AnimatePresence mode="popLayout">
            {players.map((player) => (
              <PlayerRow key={player.uid} player={player} />
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div className="space-y-4">
          <GlassCard glowColor="cyan" className="p-6 text-center">
            <p className="text-sm text-white/60 mb-2">Room Code</p>
            <p className="text-4xl font-mono font-bold tracking-[0.3em] text-neon-cyan mb-4">
              {code}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <NeonButton variant="secondary" size="sm" onClick={handleCopyCode}>
                {copied ? 'Copied!' : 'Copy'}
              </NeonButton>
              <NeonButton variant="secondary" size="sm" onClick={handleShare}>
                Share Link
              </NeonButton>
            </div>
            <SettingsSummary settings={room.settings} />
            {isHost && (
              <NeonButton
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => setEditOpen(true)}
              >
                Edit Settings
              </NeonButton>
            )}
          </GlassCard>

          {error && <p className="text-neon-pink text-sm text-center">{error}</p>}

          {isHost && (
            <NeonButton
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!canStart}
              loading={starting}
              onClick={handleStart}
            >
              Start Game
            </NeonButton>
          )}
          {!isHost && (
            <p className="text-center text-sm text-white/50">Waiting for host to start...</p>
          )}
          <NeonButton variant="danger" size="sm" className="w-full mt-2" onClick={handleLeave}>
            Leave Room
          </NeonButton>
        </motion.div>

        <motion.div className="hidden lg:block">{chatPanel}</motion.div>
      </motion.div>

      <motion.div className="lg:hidden mt-6">
        <button
          type="button"
          onClick={() => setChatOpen(!chatOpen)}
          className="w-full py-2 text-sm text-neon-cyan border border-neon-cyan/30 rounded-lg mb-2"
        >
          {chatOpen ? 'Hide Chat' : 'Show Chat'}
        </button>
        {chatOpen && chatPanel}
      </motion.div>

      <motion.div className="fixed bottom-0 left-0 right-0 p-4 bg-dark-bg/90 backdrop-blur-md border-t border-white/10 z-30">
        <NeonButton
          variant={me?.isReady ? 'secondary' : 'primary'}
          size="lg"
          className={`w-full max-w-md mx-auto block ${
            me?.isReady ? 'animate-pulse shadow-glow-cyan' : ''
          }`}
          loading={readyLoading}
          onClick={handleToggleReady}
        >
          {me?.isReady ? 'Not Ready' : 'Ready'}
        </NeonButton>
      </motion.div>
    </motion.div>
  );
}
