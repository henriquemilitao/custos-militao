// components/common/Button.tsx
"use client";
import { Loader2 } from "lucide-react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
};

export function Button({ variant = "primary", loading, children, className = "", ...props }: ButtonProps) {
  const base = "px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";
  const variants: Record<string, string> = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
      disabled={props.disabled || loading}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
      <span>{children}</span>
    </button>
  );
}
