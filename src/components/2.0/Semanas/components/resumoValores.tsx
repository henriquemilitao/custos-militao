import { formatCurrencyFromCents } from "@/lib/formatters/formatCurrency";

// Defina o tipo baseado na estrutura que você está usando
interface SemanaProcessada {
  id: string;
  label: string;
  periodo: string;
  valorGasto: number;
  valorTotal: number;
  gastosMeta: {
    id: string;
    nome: string;
    totalPlanejado: number;
    gastoNaSemana: number;
    gastoAnteriorMeta: number;
    valorDisponivelMeta: number;
  }[];
  registros?: {
    id: string;
    name: string;
    valor: number;
    data: Date;
    gastoId: string;
  }[];
}

interface ResumoValoresProps {
  semanaAtual: SemanaProcessada | null;
}

export function ResumoValores({ semanaAtual }: ResumoValoresProps) {
  // console.log('RESUMO DA SEMANAAAAAAAAA')
  // console.log({semanaAtual})
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