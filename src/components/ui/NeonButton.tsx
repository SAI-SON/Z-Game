import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface NeonButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void | Promise<void>;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

export function NeonButton({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  children,
  className = '',
}: NeonButtonProps) {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 uppercase tracking-wide';

  const variantClasses = {
    primary: 'bg-neon-cyan text-black glow-cyan hover:shadow-2xl',
    secondary: 'bg-transparent border-2 border-neon-cyan text-neon-cyan glow-cyan hover:bg-neon-cyan/10',
    danger: 'bg-neon-pink text-white glow-pink hover:shadow-2xl',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      onClick={() => {
        if (!isDisabled && onClick) {
          void Promise.resolve(onClick()).catch((err) => {
            console.error('Button action failed:', err);
          });
        }
      }}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {loading ? (
        <span className="inline-block animate-spin">⚙️</span>
      ) : (
        children
      )}
    </motion.button>
  );
}
