interface ToggleChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export default function ToggleChip({ label, selected, onClick }: ToggleChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
        selected
          ? "border-sage-300 bg-sage-300/10 text-sage-300 font-semibold"
          : "border-dark-400 bg-white/[0.02] text-muted hover:border-dark-300"
      }`}
    >
      {label}
    </button>
  );
}
