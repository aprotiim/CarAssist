interface ScoreBarProps {
  score: number;
}

export default function ScoreBar({ score }: ScoreBarProps) {
  const color =
    score >= 90 ? "#16a34a" : score >= 80 ? "#ca8a04" : "#dc2626";
  const label =
    score >= 90 ? "Great Deal" : score >= 80 ? "Fair Deal" : "Overpriced";

  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-1.5 rounded-full bg-dark-500">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold tracking-wide" style={{ color }}>
        {score} — {label}
      </span>
    </div>
  );
}
