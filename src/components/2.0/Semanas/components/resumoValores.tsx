import { formatCurrencyFromCents } from "@/lib/formatters/formatCurrency";

export function ResumoValores({ semanaAtual }: { semanaAtual: any }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-center mb-6">
      <div>
        <p className="text-sm text-gray-500">Total Semana</p>
        <p className="text-sm font-medium">{semanaAtual ? formatCurrencyFromCents(semanaAtual?.valorTotal) : "R$ 0,00"}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Gasto</p>
        <p className="text-sm font-medium text-red-500">
          {semanaAtual ? formatCurrencyFromCents(semanaAtual?.valorGasto) : "R$ 0,00"}
        </p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Disponível</p>
        <p className="text-sm font-medium text-green-600">
          {semanaAtual
            ? formatCurrencyFromCents(semanaAtual?.valorTotal - semanaAtual?.valorGasto)
            : "R$ 0,00"}
        </p>
      </div>
    </div>
  );
}