// components/economias/components/dialogBlockTipoChange.tsx
"use client";

import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/common/Button";

type DialogBlockTipoChangeProps = {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
};

export function DialogBlockTipoChange({
  showModal,
  setShowModal,
}: DialogBlockTipoChangeProps) {
  return (
    <BaseDialog
      open={showModal}
      onOpenChange={(open) => setShowModal(open)}
      title="Alteração de Tipo Bloqueada"
      footer={
        <Button variant="primary" onClick={() => setShowModal(false)}>
          Entendi
        </Button>
      }
    >
      <p className="text-sm text-gray-700">
        <span className="text-red-600 mr-2">🚫</span>
        Não é permitido alterar o tipo deste gasto porque já existem{" "}
        <strong>registros lançados neste mês</strong>.
      </p>
      <p className="text-sm text-gray-700 mt-3">
        Para alterar o tipo, primeiro exclua todos os registros relacionados a
        este gasto.
      </p>
    </BaseDialog>
  );
}
