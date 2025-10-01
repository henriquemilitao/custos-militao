// components/economias/components/dialogAvisoMigracaoTipoChange.tsx
"use client";

import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/common/Button";

type DialogAvisoMigracaoTipoChangeProps = {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onConfirm: () => void;
  dataPago?: string | null; // pra mostrar a data no aviso
};

export function DialogAvisoMigracaoTipoChange({
  showModal,
  setShowModal,
  onConfirm,
  dataPago,
}: DialogAvisoMigracaoTipoChangeProps) {
  return (
    <BaseDialog
      open={showModal}
      onOpenChange={(open) => setShowModal(open)}
      title="Aviso de Migração de Pagamento"
      footer={
        <>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Confirmar
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-700">
        <span className="text-yellow-600 mr-2">⚠️</span>
        Este gasto já foi pago como <strong>único</strong>.
      </p>
      <p className="text-sm text-gray-700 mt-3">
        Ao alterar para <strong>recorrente</strong>, o pagamento feito será
        convertido em um <strong>registro recorrente</strong> na data{" "}
        <span className="font-medium">
          {dataPago ?? "não informada"}
        </span>
        .
      </p>
    </BaseDialog>
  );
}
