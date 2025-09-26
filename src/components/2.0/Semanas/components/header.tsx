import { CicloAtualDTO } from "@/dtos/ciclo.dto";

type HeaderProps = {
  semanaAtual: any;
  semanaSelecionada: string;
  setSemanaSelecionada: (id: string) => void;
  semanas: any[];
};

export function Header({ semanaAtual, semanaSelecionada, setSemanaSelecionada, semanas }: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Controle Semanal</h2>
        <p className="text-xs text-gray-500">{semanaAtual?.periodo}</p>
      </div>
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
    </div>
  );
}
