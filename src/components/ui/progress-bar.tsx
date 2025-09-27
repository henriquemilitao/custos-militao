export default function ProgressBar({
  percent,
  label,
  forceGreen,
}: { percent: number; label?: string; forceGreen?: boolean }) {
  const p = Math.max(0, percent);

  const colorClass =
    forceGreen
      ? "bg-green-500"
      : p > 100
      ? "bg-red-600" // ultrapassou, cor mais forte
      : p > 80
      ? "bg-red-500"
      : p >= 70
      ? "bg-orange-500"
      : p >= 60
      ? "bg-yellow-400"
      : "bg-green-500";

  // largura nunca passa de 100
  const widthPercent = Math.min(100, p);

  return (
    <div className="mt-2">
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          style={{ width: `${widthPercent}%` }}
          className={`h-2 ${colorClass} transition-all`}
          role="progressbar"
          aria-valuenow={Math.round(p)}
        />
      </div>
      {label && (
        <div className="text-sm text-neutral-500 mt-1">
          {label} — {Math.round(p)}%
        </div>
      )}
    </div>
  );
}
