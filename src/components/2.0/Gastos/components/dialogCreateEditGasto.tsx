"use client";

import { useEffect, useState } from "react";
import { BaseDialog } from "@/components/common/BaseDialog";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { toast } from "sonner";
import { Gasto, TipoGasto } from "@prisma/client";
import { InputCurrency } from "../../InputCurrency";
import { Button } from "@/components/common/Button";
import { TipoGastoSelect } from "../../testeTipoGastoSelect";
import { DialogBlockTipoChange } from "./dialogBlockTipoChange";
import { DialogAvisoMigracaoTipoChange } from "./dialogAvisoMigracaoTipoChange";
import { formatDateShort } from "@/lib/formatters/formatDate";
import {
  createGastoSchema,
  editGastoSchema,
  CreateGastoDTO,
  EditGastoDTO,
} from "@/dtos/gasto.schema";
import { formatarName } from "@/lib/formatters/formatName";

type DialogCreateEditGastoProps = {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  cicloAtual: CicloAtualDTO | null;
  mutateCiclo: () => void;
  isEdit: boolean;
  setIsEdit: (edit: boolean) => void;
  gasto: Gasto | null;
};

export function DialogCreateEditGasto({
  showModal,
  setShowModal,
  cicloAtual,
  mutateCiclo,
  isEdit,
  setIsEdit,
  gasto,
}: DialogCreateEditGastoProps) {
  const [name, setName] = useState("");
  const [valor, setValor] = useState<number | null>(null);
  const [tipoGasto, setTipoGasto] = useState<TipoGasto | null>(null);
  const [confirmZero, setConfirmZero] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; tipoGasto?: string }>({});
  const [loading, setLoading] = useState(false);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showAvisoMigracaoModal, setShowAvisoMigracaoModal] = useState(false);
  const [forcarMigracao, setForcarMigracao] = useState(false);

  useEffect(() => {
    if (isEdit && gasto) {
      setName(gasto.name);
      setValor(gasto.valor);
      setTipoGasto(gasto.tipo);
    } else {
      setName("");
      setValor(null);
      setTipoGasto(null);
    }
  }, [isEdit, gasto, showModal]);

  function handleClose() {
    setShowModal(false);
    setName("");
    setValor(null);
    setTipoGasto(null);
    setConfirmZero(false);
    setErrors({});
  }

  const errorMessages: Record<string, string> = {
    name: "Nome é obrigatório",
    tipoGasto: "Selecione um tipo de Gasto",
  };

  async function handleSalvarOuEditar() {
    if (!cicloAtual?.id && !isEdit) {
      toast.error("Nenhum ciclo ativo selecionado.");
      return;
    }

    setErrors({});
    setConfirmZero(false);

    // monta payload base
    const payload = {
      name: formatarName(name.trim()),
      valorCents: valor ?? null,
      tipoGasto,
      ...(isEdit ? {} : { cicloId: cicloAtual?.id ?? "" }),
    };

    // escolhe schema
    const schema = isEdit ? editGastoSchema : createGastoSchema;
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = errorMessages[path] ?? issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    if ((parsed.data.valorCents ?? 0) === 0 && !confirmZero) {
      setConfirmZero(true);
      return;
    }

    if (isEdit) {
      await handleEditar(parsed.data as EditGastoDTO);
    } else {
      await handleCriar(parsed.data as CreateGastoDTO);
    }
  }

  async function handleCriar(data: CreateGastoDTO) {
    setLoading(true);
    try {
      const res = await fetch("/api/gastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Erro desconhecido");

      toast.success("Gasto salvo com sucesso!", {
        style: { background: "#dcfce7", color: "#166534" },
      });

      mutateCiclo();
      handleClose();
      setIsEdit(false);
    } catch (err: any) {
      toast.error(err.message || "Não foi possível salvar seu gasto");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditar(data: EditGastoDTO) {
    const jaTevePagamentosNoMes = cicloAtual?.gastosPorMetaTotais.find(
      (gastoMeta) => gastoMeta.id === gasto?.id
    );
    const tevePagamento = (jaTevePagamentosNoMes?.totalJaGasto ?? 0) > 0;
    const tipoAlterado = gasto?.tipo !== data.tipoGasto;

    if (!forcarMigracao && tevePagamento && tipoAlterado) {
      setShowBlockModal(true);
      return;
    }

    if (!forcarMigracao && gasto?.isPago && tipoAlterado) {
      setShowAvisoMigracaoModal(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/gastos/${gasto?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Erro desconhecido");

      toast.success("Gasto alterado com sucesso!", {
        style: { background: "#dcfce7", color: "#166534" },
      });

      mutateCiclo();
      handleClose();
      setIsEdit(false);
    } catch (err: any) {
      toast.error(err.message || "Não foi possível editar seu gasto");
    } finally {
      setLoading(false);
      setForcarMigracao(false);
    }
  }

  return (
    <BaseDialog
      open={showModal}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
          setIsEdit(false);
        }
        setShowModal(open);
      }}
      title={!isEdit ? "Criar Gasto" : "Editar Gasto"}
      footer={
        <>
          <Button
            variant="secondary"
            disabled={loading}
            onClick={() => {
              handleClose();
              setIsEdit(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            variant={confirmZero ? "danger" : "primary"}
            loading={loading}
            onClick={handleSalvarOuEditar}
          >
            Salvar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          className="w-full px-3 py-2 border rounded-xl focus:outline-blue-500 placeholder-gray-400"
        />
        {errors.name && (
          <span className="text-xs text-red-600 -mt-4">{errors.name}</span>
        )}

        <InputCurrency
          placeholder="Valor (R$)"
          value={valor !== null ? valor / 100 : null}
          onValueChange={(val) => {
            setConfirmZero(false);
            setValor(val !== null ? Math.round(val * 100) : null);
          }}
        />

        {confirmZero && (
          <p className="text-sm text-yellow-600 -mt-3">
            ⚠️ Você tem certeza que deseja {isEdit ? 'salvar' : 'criar '} um gasto sem 
            <span className="text-base font-semibold"> valor?</span>
          </p>
        )}

        <TipoGastoSelect
          tipoGasto={tipoGasto}
          setTipoGasto={setTipoGasto}
          setErrors={setErrors}
          gasto={gasto}
          isEdit={isEdit}
        />
        {errors.tipoGasto && (
          <span className="text-xs text-red-600 -mt-7">{errors.tipoGasto}</span>
        )}
      </div>

      <DialogBlockTipoChange
        showModal={showBlockModal}
        setShowModal={setShowBlockModal}
      />
      <DialogAvisoMigracaoTipoChange
        showModal={showAvisoMigracaoModal}
        setShowModal={setShowAvisoMigracaoModal}
        onConfirm={() => {
          setForcarMigracao(true);
          setShowAvisoMigracaoModal(false);
          handleSalvarOuEditar();
        }}
        dataPago={gasto?.dataPago ? formatDateShort(gasto?.dataPago) : undefined}
      />
    </BaseDialog>
  );
}
