"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { parseCurrency, formatCurrencyBRL } from "@/lib/currency";

type Props = {
  value: number | "";
  onChange: (valor: number) => void;
  placeholder?: string;
};

export default function InputCurrency({ value, onChange, placeholder }: Props) {
  const [display, setDisplay] = useState(formatCurrencyBRL(value === "" ? 0 : value));

  return (
    <Input
      type="text"
      inputMode="numeric"
      placeholder={placeholder ?? "R$ 0,00"}
      value={display}
      onChange={(e) => {
        const parsed = parseCurrency(e.target.value);
        setDisplay(formatCurrencyBRL(parsed));
        onChange(parsed);
      }}
      className="px-3 py-2 rounded-xl border text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  );
}
