import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'purple' | 'pink' | 'none';
  onClick?: () => void;
}

export function GlassCard({
  children,
  className = '',
  glowColor = 'none',
  onClick,
}: GlassCardProps) {
  const glowClasses = {
    cyan: 'glow-border-cyan',
    purple: 'glow-border-purple',
    pink: 'glow-border-pink',
    none: 'border border-white/10',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`glass ${glowClasses[glowColor]} ${className}`}
    >
      {children}
    </motion.div>
  );
}
