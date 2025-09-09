// src/components/ui/progress-bar.tsx
import React from "react";

export default function ProgressBar({ percent, label, forceGreen }: { percent: number; label?: string; forceGreen?: boolean }) {
  const p = Math.max(0, percent);
  const colorClass =
    forceGreen 
      ? "bg-green-500"
      : p > 100
      ? "bg-red-600"
      : p > 90
      ? "bg-red-500"
      : p >= 85
      ? "bg-orange-500"
      : p >= 80
      ? "bg-yellow-500"
      : p >= 70
      ? "bg-yellow-400"
      : p >= 60
      ? "bg-yellow-300"
      : "bg-green-500";

  return (
    <div className="mt-2">
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          style={{ width: `${Math.min(100, p)}%` }}
          className={`h-2 ${colorClass} transition-all`}
          role="progressbar"
          aria-valuenow={Math.round(p)}
        />
      </div>
      {label && <div className="text-sm text-neutral-500 mt-1">{label} — {Math.round(p)}%</div>}
    </div>
  );
}
