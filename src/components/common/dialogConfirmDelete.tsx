// components/economias/components/dialogConfirmDelete.tsx
"use client";

import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/common/Button";
import { Economia, Gasto } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";

export enum TipoItemDelete  {
  ECONOMIAS = 'economias',
  GASTOS = 'gastos'
}

type DialogConfirmDeleteProps = {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  mutateCiclo: () => void;
  item: Economia | Gasto | null;
  tipoItem: TipoItemDelete;
};

export function DialogConfirmDelete({ showModal, setShowModal, mutateCiclo, item, tipoItem }: DialogConfirmDeleteProps) {
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
      title="Confirmação"
      footer={
        <>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" loading={loading} onClick={handleDelete}>
            Excluir
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-700">
        <span className="text-yellow-600 mr-2">⚠️</span>
        <span>Você tem certeza que deseja excluir </span>
        <strong className="text-blue-700"> {itemNome}?</strong>
      </p>
    </BaseDialog>
  );
}
