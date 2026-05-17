interface RankBadgeProps {
  rank: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'legend';
}

export function RankBadge({ rank }: RankBadgeProps) {
  const rankColors = {
    bronze: { bg: 'bg-amber-900', text: 'text-amber-400', border: 'border-amber-500' },
    silver: { bg: 'bg-gray-700', text: 'text-gray-300', border: 'border-gray-400' },
    gold: { bg: 'bg-yellow-900', text: 'text-yellow-300', border: 'border-yellow-500' },
    platinum: { bg: 'bg-cyan-900', text: 'text-neon-cyan', border: 'border-neon-cyan' },
    diamond: { bg: 'bg-blue-900', text: 'text-blue-300', border: 'border-blue-500' },
    master: { bg: 'bg-purple-900', text: 'text-neon-purple', border: 'border-neon-purple' },
    legend: { bg: 'bg-pink-900', text: 'text-neon-pink', border: 'border-neon-pink' },
  };

  const colors = rankColors[rank];

  return (
    <div
      className={`${colors.bg} ${colors.text} border ${colors.border} px-3 py-1 rounded-full text-sm font-bold uppercase`}
    >
      {rank}
    </div>
  );
}
