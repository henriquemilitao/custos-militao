// types/controle-semanal.types.ts

interface GastoMeta {
  id: string;
  nome: string;
  totalPlanejado: number;
  gastoNaSemana: number;
  gastoAnteriorMeta: number;
  valorDisponivelMeta: number;
}

interface RegistroGasto {
  id: string;
  name: string;
  valor: number;
  data: Date;
  gastoId: string;
}

interface SemanaProcessada {
  id: string;
  label: string;
  periodo: string;
  valorGasto: number;
  valorTotal: number;
  gastosMeta: GastoMeta[];
  registros?: RegistroGasto[];
}

// Para o componente Header
type HeaderProps = {
  semanaAtual: SemanaProcessada | null;
  semanaSelecionada: string;
  setSemanaSelecionada: (id: string) => void;
  semanas: SemanaProcessada[];
};

export function Header({ semanaAtual, semanaSelecionada, setSemanaSelecionada, semanas }: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Controle Semanal</h2>
        <p className="text-xs text-gray-500">{semanaAtual?.periodo}</p>
      </div>
      {semanaAtual?.id && (
          <select
            value={semanaSelecionada}
            onChange={(e) => setSemanaSelecionada(e.target.value)}
            className="border rounded-lg px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {semanas.map((sem) => (
              <option key={sem.id} value={sem.id}>
                {sem.label}
              </option>
            ))}
          </select>
      )}
    </div>
  );
}

// Para outros componentes que também usam estes tipos:

// ResumoValores props
type ResumoValoresProps = {
  semanaAtual: SemanaProcessada | null;
};

// GastosPorMeta props  
type GastosPorMetaProps = {
  gastosMeta: GastoMeta[];
  onAddGasto: (gastoId: string) => void;
};

// ListagemPorCategoria props
interface GastoAgrupadoPorData {
  id: string;
  name: string;
  valor: number;
  data: Date;
  gastoId: string;
}

interface CategoriAgrupada {
  valorDisponivel: number;
  gastoNaSemana: number;
  datas: Record<string, GastoAgrupadoPorData[]>;
}

type ListagemPorCategoriaProps = {
  gastosPorCategoria: Record<string, CategoriAgrupada>;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  cicloAtual: any; // Mantenha este any se CicloAtualDTO for muito complexo
  isEdit: boolean;
  setIsEdit: (edit: boolean) => void;
  mutateCiclo: () => void;
  setCurrentGasto: (gasto: RegistroGasto | null) => void;
  currentGasto: RegistroGasto | null;
};

// Exports para usar em outros arquivos
export type {
  GastoMeta,
  RegistroGasto,
  SemanaProcessada,
  HeaderProps,
  ResumoValoresProps,
  GastosPorMetaProps,
  ListagemPorCategoriaProps,
  CategoriAgrupada,
  GastoAgrupadoPorData
};