// components/InputCurrency.tsx
"use client";

import { NumericFormat } from "react-number-format";

type InputCurrencyProps = {
  value?: number;
  onValueChange?: (value: number) => void;
  placeholder?: string;
  className?: string;
};

export function InputCurrency({ value, onValueChange, placeholder, className }: InputCurrencyProps) {
  return (
    <NumericFormat
      value={value}
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
          onValueChange(values.floatValue || 0);
        }
      }}
    />
  );
}
