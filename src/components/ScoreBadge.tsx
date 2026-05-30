/** ScoreBadge — color-coded affordability score. Lower is better. */
export default function ScoreBadge({ score }: { score: number }) {
  let label: string;
  let color: string;
  let icon: string;

  if (score <= 0.4) {
    label = 'Excellent';
    color = 'bg-green-100 text-green-800 border-green-200';
    icon = '✓';
  } else if (score <= 0.7) {
    label = 'Good';
    color = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    icon = '~';
  } else {
    label = 'Stretch';
    color = 'bg-red-100 text-red-800 border-red-200';
    icon = '⚠';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}
      title={`Affordability score: ${score.toFixed(2)} (lower is better)`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
