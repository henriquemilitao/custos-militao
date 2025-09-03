import { useState } from "react";
import { Trash2, CheckCircle, RotateCcw, Plus } from "lucide-react";
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

  const togglePago = () => {
    atualizarEstado({
      categorias: estado.categorias.map((c) =>
        c.id === categoria.id ? { ...c, pago: !c.pago } : c
      ),
    });
  };

  const removerCategoria = () => {
    atualizarEstado({
      categorias: estado.categorias.filter((c) => c.id !== categoria.id),
    });
  };

  if (isGasolina) {
    return (
      <div className="p-4 border rounded-2xl shadow bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-800">
            {categoria.nome} - Total gasto: R$ {totalGasto.toFixed(2)}
          </h3>
          <Button variant="ghost" onClick={removerCategoria} className="text-red-500 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <p
          className={`text-base font-semibold mb-4 ${
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
          <Button
            onClick={adicionarGasolina}
            size="icon"
            className="w-10 h-10 rounded-full border border-blue-400 text-blue-500 bg-white shadow-none hover:bg-blue-500 hover:text-white"
          >
            <Plus className="w-5 h-5" />
          </Button>

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

  // Categoria normal
  return (
    <div
      className={`p-4 border rounded-2xl shadow flex items-center justify-between transition duration-200 ${
        categoria.pago ? "opacity-70 bg-gray-100" : "opacity-100 bg-white"
      }`}
    >
      <div>
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          {categoria.nome}
          {categoria.pago && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
        </h3>
        <p className="text-base text-gray-600">
          Valor: R$ {categoria.meta.toFixed(2)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePago}
          className={categoria.pago ? "text-blue-500" : "text-green-600"}
        >
          {categoria.pago ? (
            <RotateCcw className="w-5 h-5" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-700"
          onClick={removerCategoria}
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
