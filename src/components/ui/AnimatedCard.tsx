import { motion } from 'framer-motion';
import type { Card } from '../../types';

interface AnimatedCardProps {
  card?: Card;
  faceUp?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function AnimatedCard({
  card,
  faceUp = true,
  selected = false,
  onClick,
  className = '',
}: AnimatedCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`relative w-24 h-32 cursor-pointer perspective ${className}`}
    >
      <motion.div
        initial={{ rotateY: faceUp ? 0 : 180 }}
        animate={{ rotateY: faceUp ? 0 : 180 }}
        transition={{ duration: 0.6 }}
        className={`w-full h-full ${
          selected ? 'glow-border-cyan' : 'border border-white/20'
        } rounded-lg flex flex-col items-center justify-center glass ${
          selected ? 'scale-110' : ''
        }`}
        style={{
          backfaceVisibility: 'hidden',
          transformStyle: 'preserve-3d',
        } as any}
      >
        {faceUp && card ? (
          <>
            <div
              className="text-4xl mb-2"
              style={{ filter: 'drop-shadow(0 0 8px rgba(0, 245, 255, 0.5))' }}
            >
              {card.emoji}
            </div>
            <div className="text-xs font-bold text-center text-neon-cyan uppercase">
              {card.type}
            </div>
          </>
        ) : (
          <div className="text-2xl opacity-50">Z</div>
        )}
      </motion.div>
    </motion.div>
  );
}
