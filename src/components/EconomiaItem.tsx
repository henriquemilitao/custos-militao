import { useState } from "react";
import { CheckCircle, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Economia } from "./ConfigEconomia";

function moeda(n: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(isFinite(n) ? n : 0);
}

export default function EconomiaItem({
  economia,
  onAdicionarAporte,
  onRemoverAporte,
  onRemove,
}: {
  economia: Economia;
  onAdicionarAporte: (valor: number) => void;
  onRemoverAporte: (aporteId: string) => void;
  onRemove: () => void;
}) {
  const [novoValor, setNovoValor] = useState("");
  const guardado = economia.aportes.reduce((s, a) => s + a.valor, 0);
  const concluida = guardado >= economia.meta;

  const adicionar = () => {
    const valor = parseFloat(novoValor);
    if (!valor || valor <= 0) return;
    onAdicionarAporte(valor);
    setNovoValor("");
  };

  return (
    <Card className="p-4 border rounded-2xl shadow bg-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {economia.titulo}
          {concluida && <CheckCircle className="w-5 h-5 text-green-600" />}
        </h3>
        <Button
          variant="ghost"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Meta: {moeda(economia.meta)} — Guardado: {moeda(guardado)}
      </p>

      {/* adicionar valor */}
      <div className="flex items-center gap-2 mb-4">
        <Input
          type="number"
          placeholder="Valor"
          value={novoValor}
          onChange={(e) => setNovoValor(e.target.value)}
          className="flex-1"
        />
        <Button onClick={adicionar} size="sm" className="bg-green-500 text-white hover:bg-green-600">
          Guardar
        </Button>
      </div>

      {/* lista de aportes */}
      <ul className="space-y-2">
        {economia.aportes.map((a) => (
          <li
            key={a.id}
            className="flex justify-between items-center p-2 border rounded bg-gray-50 shadow-sm"
          >
            <span>
              {a.data} — {moeda(a.valor)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700"
              onClick={() => onRemoverAporte(a.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
