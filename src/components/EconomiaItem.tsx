"use client";

import { CheckCircle, RotateCcw, Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfigEconomia, { Economia } from "./ConfigEconomia";

export default function EconomiaItem({
  economia,
  onToggle,
  onRemove,
  onSalvarEdit,
}: {
  economia: Economia;
  onToggle: () => void;
  onRemove: () => void;
  onSalvarEdit: (id: string, dados: { titulo: string; meta: number }) => void;
}) {
  return (
    <div
      className={`p-4 border rounded-2xl shadow flex items-center justify-between transition duration-200 ${
        economia.economizado ? "opacity-80 bg-green-50 border-green-200" : "opacity-100 bg-white"
      }`}
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 break-all whitespace-normal max-w-[200px]">
          {economia.titulo}
          {economia.economizado && <CheckCircle className="w-5 h-5 text-green-600" />}
        </h3>
        <p className="text-base text-gray-600">
          Meta: R$ {economia.meta.toFixed(2)}
        </p>
      </div>

      <div className="flex items-center gap-1">
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

        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-700"
          onClick={onRemove}
          title="Remover economia"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
