"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

type Props = {
  value: number | "";
  onChange: (valor: number) => void;
  placeholder?: string;
};

export default function InputCurrency({ value, onChange, placeholder }: Props) {
  const [display, setDisplay] = useState(format(value));

  function format(n: number | "") {
    if (n === "") return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(isFinite(n) ? n : 0);
  }

  function parseCurrency(str: string) {
    const onlyDigits = str.replace(/\D/g, "");
    return Number(onlyDigits) / 100;
  }

  return (
    <Input
      type="text"
      inputMode="numeric"
      placeholder={placeholder ?? "R$ 0,00"}
      value={display}
      onChange={(e) => {
        const parsed = parseCurrency(e.target.value);
        setDisplay(format(parsed));
        onChange(parsed);
      }}
      className="px-3 py-2 rounded-xl border text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  );
}
