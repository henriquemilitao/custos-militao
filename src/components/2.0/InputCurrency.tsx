"use client";

import { useState, useEffect } from "react";

type InputCurrencyProps = {
  value?: number | null; // valor em reais
  onValueChange?: (value: number | null) => void;
  placeholder?: string;
  className?: string;
};

export function InputCurrency({
  value,
  onValueChange,
  placeholder,
  className,
}: InputCurrencyProps) {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (value !== null && value !== undefined && value !== 0) {
      setDraft(format(value));
    } else {
      setDraft(""); // mostra placeholder em vazio ou zero
    }
  }, [value]);

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

  return (
    <input
      type="text"
      inputMode="numeric"
      className={`w-full px-3 py-2 border rounded-xl focus:outline-blue-500 ${className || ""}`}
      value={draft}
      placeholder={placeholder || "Digite um valor"}
      onChange={(e) => {
        const parsed = parseCurrency(e.target.value);

        // se digitou vazio -> null
        if (e.target.value.trim() === "") {
          setDraft("");
          onValueChange?.(null);
          return;
        }

        setDraft(format(parsed));
        onValueChange?.(parsed);
      }}
    />
  );
}
