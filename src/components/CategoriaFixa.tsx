import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoriaFixaType, EstadoMes } from "@/app/page";

export default function CategoriaFixa({
  categoria,
  estado,
  atualizarEstado,
}: {
  categoria: CategoriaFixaType;
  estado: EstadoMes;
  atualizarEstado: (novoEstado: Partial<EstadoMes>) => void;
}) {
  const isGasolina = categoria.nome.toLowerCase() === "gasolina";
  const [novoValor, setNovoValor] = useState("");

  const formatarData = () => new Date().toLocaleDateString("pt-BR");
  const totalGasto = estado.gasolinaGastos.reduce((sum, g) => sum + g.valor, 0);
  const restante = categoria.meta - totalGasto;

  const adicionarGasolina = () => {
    const valor = parseFloat(novoValor);
    if (!valor || valor <= 0) return;

    atualizarEstado({
      gasolinaGastos: [
        ...estado.gasolinaGastos,
        { id: crypto.randomUUID(), data: formatarData(), valor },
      ],
    });

    setNovoValor("");
  };

  const removerGasolina = (id: string) => {
    atualizarEstado({
      gasolinaGastos: estado.gasolinaGastos.filter((g) => g.id !== id),
    });
  };

  if (isGasolina) {
    return (
      <div className="p-4 border rounded-2xl shadow bg-white">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {categoria.nome} - Total gasto: R$ {totalGasto.toFixed(2)}
        </h3>

        <p
          className={`text-sm font-semibold mb-4 ${
            restante >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          Pode gastar ainda: R$ {restante.toFixed(2)}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <Input
            type="number"
            placeholder="Valor"
            value={novoValor}
            onChange={(e) => setNovoValor(e.target.value)}
            className="flex-1"
          />
          <Button onClick={adicionarGasolina}>Adicionar</Button>
        </div>

        <ul className="space-y-2">
          {estado.gasolinaGastos.map((gasto) => (
            <li
              key={gasto.id}
              className="flex justify-between items-center p-2 border rounded bg-gray-50 shadow-sm"
            >
              <span>
                {gasto.data} - R$ {gasto.valor.toFixed(2)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700"
                onClick={() => removerGasolina(gasto.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-2xl shadow bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-800">{categoria.nome}</h3>
      <p className="text-sm text-gray-600">Valor: R$ {categoria.meta.toFixed(2)}</p>
    </div>
  );
}
