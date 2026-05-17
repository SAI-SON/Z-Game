const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-base',
  md: 'w-10 h-10 text-xl',
  lg: 'w-20 h-20 text-4xl',
} as const;

export function isAvatarUrl(avatar: string): boolean {
  return avatar.startsWith('http://') || avatar.startsWith('https://');
}

interface UserAvatarProps {
  avatar: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export function UserAvatar({ avatar, size = 'md', className = '' }: UserAvatarProps) {
  const sizeClass = SIZE_CLASSES[size];

  if (isAvatarUrl(avatar)) {
    return (
      <img
        src={avatar}
        alt=""
        referrerPolicy="no-referrer"
        className={`rounded-full object-cover bg-neon-cyan/20 shrink-0 ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-neon-cyan/20 flex items-center justify-center shrink-0 ${sizeClass} ${className}`}
      aria-hidden
    >
      <span className="leading-none">{avatar}</span>
    </div>
  );
}
