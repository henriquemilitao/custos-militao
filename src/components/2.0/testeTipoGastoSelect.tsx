import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, BarChart } from "lucide-react";
import { TipoGastoEnum } from "@/dtos/gasto.schema";

type TipoGastoSelectProps = {
  tipoGasto: TipoGastoEnum | null
  setTipoGasto: (tipo: TipoGastoEnum) => void
  setErrors: (tipo: {nome?: string, tipoGasto?: string}) => void
}

export function TipoGastoSelect({tipoGasto, setTipoGasto, setErrors}: TipoGastoSelectProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    {
      value: TipoGastoEnum.SINGLE,
      title: "Gasto Fixo",
      desc: "Pago uma única vez por mês (ex.: aluguel, internet).",
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      value: TipoGastoEnum.GOAL,
      title: "Gasto com Meta",
      desc: "Pago várias vezes ao longo do mês (ex.: mercado, combustível).",
      icon: <BarChart className="w-5 h-5" />
    }
  ];

  return (
    <div className="space-y-2 mb-4">
      <p className="text-sm font-medium">Tipo de gasto</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((opt) => (
          <Card
            key={opt.value}
            onClick={() => {
              setSelected(opt.value)
              setTipoGasto(opt.value)
              setErrors({})
            }}
            className={`cursor-pointer transition-all  ${
              selected === opt.value ? "border-blue-500 shadow-lg bg-blue-50" : "hover:border-blue-400"
            }`}
          >
            <CardContent className="flex flex-col gap-2 p-4 py-0">
              <div className="flex items-center gap-2">
                {opt.icon}
                <span className="font-semibold">{opt.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">{opt.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
