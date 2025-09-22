import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, BarChart } from "lucide-react";
import { Gasto, TipoGasto } from "@prisma/client";

type TipoGastoSelectProps = {
  tipoGasto: TipoGasto | null;
  setTipoGasto: (tipo: TipoGasto | null) => void;
  setErrors: (tipo: { nome?: string; tipoGasto?: string }) => void;
  isEdit: boolean;
  gasto: Gasto | null;
};

export function TipoGastoSelect({
  tipoGasto,
  setTipoGasto,
  setErrors,
  isEdit,
  gasto,
}: TipoGastoSelectProps) {
  const [selected, setSelected] = useState<TipoGasto | null>(null);

  // Quando abrir modal em edição, seta tanto selected quanto tipoGasto
  useEffect(() => {
    if (isEdit && gasto) {
      setSelected(gasto.tipo);
      setTipoGasto(gasto.tipo);
    } else {
      setSelected(null);
      setTipoGasto(null);
    }
  }, [isEdit, gasto, setTipoGasto]);

  // Mantém o selected sincronizado com a prop tipoGasto
  useEffect(() => {
    setSelected(tipoGasto);
  }, [tipoGasto]);

  const options = [
    {
      value: TipoGasto.single,
      title: "Gasto Fixo",
      desc: "Pago uma única vez por mês (ex.: aluguel, internet).",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      value: TipoGasto.goal,
      title: "Gasto com Meta",
      desc: "Pago várias vezes ao longo do mês (ex.: mercado, combustível).",
      icon: <BarChart className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-2 mb-4">
      <p className="text-sm font-medium">Tipo de gasto</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((opt) => (
          <Card
            key={opt.value}
            onClick={() => {
              setSelected(opt.value);
              setTipoGasto(opt.value);
              setErrors({});
            }}
            className={`cursor-pointer transition-all ${
              selected === opt.value
                ? "border-blue-500 shadow-lg bg-blue-50"
                : "hover:border-blue-400"
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
