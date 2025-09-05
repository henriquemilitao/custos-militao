"use client";

import { CheckCircle, RotateCcw, Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfigEconomia, { Economia } from "./ConfigEconomia";

export default function EconomiaItem({
  economia,
  onToggle,
  onRemove,
  onSalvarEdit,
  totalDisponivel,
}: {
  economia: Economia;
  onToggle: () => void;
  onRemove: () => void;
  onSalvarEdit: (id: string, dados: { titulo: string; meta: number }) => void;
  totalDisponivel: number;
}) {
  const isReserva = economia.titulo === "Reserva de Emergência";
  const percentual = ((economia.meta / totalDisponivel) * 100).toFixed(0);

  // meta final da reserva = 10% inicial, se não foi editada
  const defaultMeta = totalDisponivel * 0.1;
  const isDefault = isReserva && Math.abs(economia.meta - defaultMeta) < 0.01;

  return (
    <div
      className={`p-4 border rounded-2xl shadow flex items-center justify-between transition duration-200 ${
        // economia.economizado ? "opacity-80 bg-green-50 border-green-200" : "opacity-100 bg-white"
        economia.economizado ? "opacity-60 bg-green-50 border-green-300" : "opacity-100 bg-white"
      }`}
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 break-words whitespace-normal max-w-[200px]">
          {economia.titulo}
          {economia.economizado && <CheckCircle className="w-5 h-5 text-green-600" />}
        </h3>

        {isReserva ? (
          <p className="text-base text-gray-600">
            Valor: R$ {economia.meta.toFixed(2)} <span className="text-gray-400 text-sm">({percentual}% do que você ganha
            {isDefault ? ", por padrão" : ""})</span>
          </p>
        ) : (
          <p className="text-base text-gray-600">
            Valor: R$ {economia.meta.toFixed(2)}
          </p>
        )}
      </div>

      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={economia.economizado ? "text-blue-500" : "text-green-600"}
          title={economia.economizado ? "Desmarcar como economizado" : "Marcar como economizado"}
        >
          {economia.economizado ? <RotateCcw className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
        </Button>

        <ConfigEconomia
          initial={{ id: economia.id, titulo: economia.titulo, meta: economia.meta }}
          onSalvarEdit={onSalvarEdit}
          isReserva={isReserva}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-600 hover:text-neutral-800"
              title="Editar"
            >
              <Edit3 className="w-5 h-5" />
            </Button>
          }
        />

        {!isReserva && (
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700"
            onClick={onRemove}
            title="Remover economia"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
