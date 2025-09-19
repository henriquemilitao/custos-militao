// components/InputCurrency.tsx
"use client";

import { NumericFormat } from "react-number-format";

type InputCurrencyProps = {
  value?: number | null;
  onValueChange?: (value: number | null) => void;
  placeholder?: string;
  className?: string;
};

export function InputCurrency({ value, onValueChange, placeholder, className }: InputCurrencyProps) {
  return (
    <NumericFormat
      value={value === null ? undefined : value}
      thousandSeparator="."
      decimalSeparator=","
      prefix="R$ "
      decimalScale={2}
      fixedDecimalScale
      allowNegative={false}
      placeholder={placeholder || "Digite um valor"}
      className={`w-full px-3 py-2 border rounded-xl focus:outline-blue-500 ${className || ""}`}
      onValueChange={(values) => {
        if (onValueChange) {
          // values.floatValue é undefined quando campo vazio
          onValueChange(values.floatValue ?? null);
        }
      }}
    />
  );
}
