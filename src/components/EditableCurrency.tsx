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
  const [draft, setDraft] = useState(format(value));

  function format(n: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(isFinite(n) ? n : 0);
  }

  function parseCurrency(str: string) {
    const onlyDigits = str.replace(/\D/g, "");
    const number = Number(onlyDigits) / 100;
    return number;
  }

  return editing ? (
    <input
      autoFocus
      type="text"
      className="text-2xl font-semibold bg-transparent focus:outline-none w-full"
      value={draft}
      onChange={(e) => {
        const parsed = parseCurrency(e.target.value);
        setDraft(format(parsed));
      }}
      onBlur={() => {
        const parsed = parseCurrency(draft);
        onChange(parsed);
        setEditing(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const parsed = parseCurrency(draft);
          onChange(parsed);
          setEditing(false);
        }
      }}
    />
  ) : (
    <button
      onClick={() => {
        setDraft(format(value));
        setEditing(true);
      }}
      className="text-2xl font-semibold text-left w-full"
    >
      {format(value)}
    </button>
  );
}
