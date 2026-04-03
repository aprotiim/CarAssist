interface StepProgressProps {
  current: number;
  total: number;
}

export default function StepProgress({ current, total }: StepProgressProps) {
  return (
    <div className="flex gap-1 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="flex-1 h-0.5 rounded-full transition-all duration-400"
          style={{
            background:
              i <= current
                ? "linear-gradient(90deg, #6ee7b7, #3b82f6)"
                : "#1a1a2e",
          }}
        />
      ))}
    </div>
  );
}
