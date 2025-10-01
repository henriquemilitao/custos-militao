"use client";
import { Loader2 } from "lucide-react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "white";
  loading?: boolean;
};

export function Button({
  variant = "primary",
  loading,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "rounded-xl font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2";

  const variants: Record<string, string> = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 justify-center",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 justify-center",
    danger: "bg-red-600 text-white hover:bg-red-700 px-4 py-2 justify-center",
    white: "bg-white border text-black hover:bg-gray-100 px-4 py-2 justify-center",
  };

  return (
    <button
      className={`${base} ${className} ${variants[variant]}`}

      {...props}
      disabled={props.disabled || loading}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
      <span>{children}</span>
    </button>
  );
}
