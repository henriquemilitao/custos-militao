"use client";

import { useState } from "react";

export default function EditableCurrency({
  value,
  onChange,
}: {
  value: number;
  onChange: (novo: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  function format(n: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(isFinite(n) ? n : 0);
  }

  return editing ? (
    <input
      autoFocus
      type="number"
      className=""
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        onChange(Number(draft) || 0);
        setEditing(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onChange(Number(draft) || 0);
          setEditing(false);
        }
      }}
    />
  ) : (
    <button
      onClick={() => {
        setDraft(String(value));
        setEditing(true);
      }}
      className="text-2xl font-semibold hover:underline"
    >
      {format(value)}
    </button>
  );
}
