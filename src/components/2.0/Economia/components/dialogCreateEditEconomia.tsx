// components/economias/components/dialogCreateEditEconomia.tsx
"use client";

import { useEffect, useState } from "react";
import { BaseDialog } from "@/components/common/BaseDialog";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { toast } from "sonner";
import { Economia } from "@prisma/client";
import { InputCurrency } from "../../InputCurrency";
import { Button } from "@/components/common/Button";
import { z } from "zod";
import {
  createEconomiaSchema,
  editEconomiaSchema,
  CreateEconomiaDTO,
  EditEconomiaDTO,
} from "@/dtos/economia.schema";

type DialogCreateEditEconomiaProps = {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  cicloAtual: CicloAtualDTO | null;
  mutateCiclo: () => void;
  isEdit: boolean;
  setIsEdit: (edit: boolean) => void;
  economia: Economia | null;
};

export function DialogCreateEditEconomia({
  showModal,
  setShowModal,
  cicloAtual,
  mutateCiclo,
  isEdit,
  setIsEdit,
  economia,
}: DialogCreateEditEconomiaProps) {
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState<number | null>(null); // cents
  const [confirmZero, setConfirmZero] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; valorCents?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && economia) {
      setNome(economia.nome);
      setValor(economia.valor);
    } else {
      setNome("");
      setValor(null);
    }
  }, [isEdit, economia, showModal]);

  function handleClose() {
    setShowModal(false);
    setNome("");
    setValor(null);
    setConfirmZero(false);
    setErrors({});
  }

  const errorMessages: Record<string, string> = {
    name: "Nome é obrigatório",
    valorCents: "Digite um valor",
    cicloId: "Ciclo inválido",
  };

  async function handleSalvarOuEditar() {
    if (!cicloAtual?.id && !isEdit) {
      toast.error("Nenhum ciclo ativo selecionado.");
      return;
    }

    setErrors({});
    setConfirmZero(false);

    // Payload base
    const payload = {
      name: nome.trim(),
      valorCents: valor ?? null,
      ...(isEdit ? {} : { cicloId: cicloAtual?.id ?? "" }),
    };

    // Escolhe schema de acordo com o modo
    const schema = isEdit ? editEconomiaSchema : createEconomiaSchema;
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

    // Confirm zero/null
    const valorValid = parsed.data.valorCents;
    if ((valorValid === null || valorValid === 0) && !confirmZero) {
      setConfirmZero(true);
      return;
    }

    if (isEdit) {
      await handleEditar(parsed.data as EditEconomiaDTO);
    } else {
      await handleCriar(parsed.data as CreateEconomiaDTO);
    }
  }

  async function handleCriar(data: CreateEconomiaDTO) {
    setLoading(true);
    try {
      const body = {
        name: formatarName(data.name),
        valorCents: data.valorCents ?? 0,
        cicloId: data.cicloId,
      };

      const res = await fetch("/api/economias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Erro desconhecido");

      toast.success("Economia salva com sucesso!", {
        style: { background: "#dcfce7", color: "#166534" },
      });

      mutateCiclo();
      handleClose();
      setIsEdit(false);
    } catch (err: any) {
      toast.error(err.message || "Não foi possível salvar a economia");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditar(data: EditEconomiaDTO) {
    if (!economia?.id) {
      toast.error("Economia inválida para edição.");
      return;
    }

    setLoading(true);
    try {
      const body = {
        name: formatarName(data.name),
        valorCents: data.valorCents ?? 0,
      };

      const res = await fetch(`/api/economias/${economia.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Erro desconhecido");

      toast.success("Economia alterada com sucesso!", {
        style: { background: "#dcfce7", color: "#166534" },
      });

      mutateCiclo();
      handleClose();
      setIsEdit(false);
    } catch (err: any) {
      toast.error(err.message || "Não foi possível editar a economia");
    } finally {
      setLoading(false);
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
      title={!isEdit ? "Nova Economia" : "Editar Economia"}
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
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          className="w-full px-3 py-2 border rounded-xl focus:outline-blue-500 placeholder-gray-400"
        />
        {errors.name && (
          <span className="text-xs text-red-600 -mt-3 -mb-2">{errors.name}</span>
        )}

        <InputCurrency
          placeholder="Valor (R$)"
          value={valor !== null ? valor / 100 : null} // mostra em reais
          onValueChange={(val) =>{
            setConfirmZero(false)
            setValor(val !== null ? Math.round(val * 100) : null)
          }}
        />

        {confirmZero && (
          <p className="text-sm text-yellow-600 -mt-2">
            ⚠️ Você tem certeza que deseja salvar uma economia sem{" "}
            <span className="text-base font-semibold">valor?</span>
          </p>
        )}
      </div>
    </BaseDialog>
  );
}
