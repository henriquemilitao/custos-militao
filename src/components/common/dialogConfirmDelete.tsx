// components/economias/components/dialogConfirmDelete.tsx
"use client";

import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/common/Button";
import { Economia, Gasto, TipoGasto } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";

export enum TipoItemDelete  {
  ECONOMIAS = 'economias',
  GASTOS = 'gastos',
  REGISTROS = 'registros'
}

type DialogConfirmDeleteProps = {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  mutateCiclo: () => void;
  item: Economia | Gasto | { id: string; name: string; valor: number; data: Date; gastoId: string } | null;
  tipoItem: TipoItemDelete;
};

export function DialogConfirmDelete({ showModal, setShowModal, mutateCiclo, item, tipoItem }: DialogConfirmDeleteProps) {
  console.log('aaaaa')
  const [loading, setLoading] = useState(false);

  // pega o nome certo independente do tipo
  const itemNome = (item as Economia)?.nome ?? (item as Gasto)?.name ?? "este item";


  const handleDelete = async () => {
    if (!item?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/${tipoItem}/${item.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error || "Erro ao excluir seu item");
        setLoading(false);
        return;
      }

      toast.success("Item deletado com sucesso!", { style: { background: "#fff7ed", color: "#92400e" }});

      mutateCiclo();
      setShowModal(false);
    } catch {
      toast.error("Não foi possível excluir seu item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseDialog
      open={showModal}
      onOpenChange={(open) => setShowModal(open)}
      title="Confirmação de Exclusão"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button variant="danger" loading={loading} onClick={handleDelete}>
            Excluir
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-gray-700 text-sm leading-relaxed">
          <span className="text-yellow-500 mr-2">⚠️</span>
          Tem certeza que deseja excluir{" "}
          <strong className="text-blue-600">{itemNome}</strong>?
        </p>

        {tipoItem === TipoItemDelete.GASTOS &&
          (item as Gasto)?.tipo === TipoGasto.goal && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <strong>⚠ Atenção:</strong> Todos os registros relacionados a este
              gasto também serão <span className="font-semibold">DELETADOS</span>.
            </div>
          )}
      </div>
    </BaseDialog>

  );
}
