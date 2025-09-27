import { formatCurrencyFromCents } from "@/lib/formatters/formatCurrency";

export function ListagemPorData({ gastosPorData }: { gastosPorData: Record<string, { nome: string; valor: number }[]> }) {
  console.log(gastosPorData === undefined ? 'a' : 'b');
  console.log(gastosPorData);
  return (
    <div className={`space-y-4 flex-1 ${Object.keys(gastosPorData).length > 0 ? 'mb-10' : 'mb-3'}`}>
      {Object.entries(gastosPorData).map(([data, gastos], idx) => (
        <div key={idx}>
          <p className="text-sm font-semibold text-gray-700 mb-1">📅 {data}</p>
          <ul className="space-y-1">
            {gastos.map((g, i) => (
              <li
                key={i}
                className="flex justify-between text-sm text-gray-600 border-b last:border-0 py-1"
              >
                <span>- {g.nome}</span>
                <span>{formatCurrencyFromCents(g.valor)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
