// components/economias/components/dialogCreateEditEconomia.tsx
"use client";

import { useEffect, useState } from "react";
import { BaseDialog } from "@/components/common/BaseDialog";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { toast } from "sonner";
import { Economia } from "@prisma/client";
import { InputCurrency } from "../../InputCurrency";
import { Button } from "@/components/common/Button";

type DialogCreateEditEconomiaProps = {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  cicloAtual: CicloAtualDTO | null;
  mutateCiclo: () => void; // <- novo
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
  const [errors, setErrors] = useState<{ nome?: string }>({});
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

  async function handleSalvar() {
    if (!cicloAtual?.id) {
      toast.error("Nenhum ciclo ativo selecionado.");
      return;
    }

    if (!nome.trim()) {
      setErrors({ nome: "Nome é obrigatório" });
      return;
    }

    if ((valor === null || valor === 0) && !confirmZero) {
      setConfirmZero(true);
      return;
    }

    setLoading(true);
    try {
      const body = { nome: nome.trim(), valorCents: Math.round(valor ?? 0), cicloId: cicloAtual.id };

      const res = await fetch("/api/economias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error || "Erro desconhecido");
        return;
      }

      toast.success("Economia salva com sucesso!", {
        style: {
          background: "#dcfce7", // verdinho claro
          color: "#166534", // texto verde escuro
        },
      });
      mutateCiclo();

      handleClose();
      setIsEdit(false);
    } catch (err) {
      toast.error("Não foi possível salvar a economia");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditar() {
    if (!cicloAtual?.id) {
      toast.error("Nenhum ciclo ativo selecionado.");
      return;
    }

    if (!nome.trim()) {
      setErrors({ nome: "Nome é obrigatório" });
      return;
    }

    if ((valor === null || valor === 0) && !confirmZero) {
      setConfirmZero(true);
      return;
    }

    setLoading(true);
    try {
      const body = { nome: nome.trim(), valorCents: Math.round(valor ?? 0) };

      const res = await fetch(`/api/economias/${economia?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error || "Erro desconhecido");
        return;
      }

      toast.success("Economia alterada com sucesso!", {
        style: {
          background: "#dcfce7",
          color: "#166534",
        },
      });
      mutateCiclo();

      handleClose();
      setIsEdit(false);
    } catch (err) {
      toast.error("Não foi possível editar a economia");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BaseDialog
      open={showModal}
      onOpenChange={(open) => {
        // Quando fechar: limpar e reconfigurar isEdit
        if (!open) {
          handleClose();
          setIsEdit(false);
          setShowModal(false);
        } else {
          setShowModal(true);
        }
      }}
      title={!isEdit ? "Nova Economia" : "Editar Economia"}
      footer={
        <>
          <Button variant="secondary" disabled={loading} 
              onClick={() => {
                handleClose();
                setIsEdit(false);
              }}>
              Cancelar
          </Button>
          <Button variant={confirmZero ? 'danger' : 'primary'} loading={loading} onClick={isEdit ? handleEditar : handleSalvar}>
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
            if (errors.nome) {
              setErrors((prev) => ({ ...prev, nome: undefined }));
            }
          }}
          className="w-full px-3 py-2 border rounded-xl focus:outline-blue-500 placeholder-gray-400"
        />
        {errors.nome && <span className="text-xs text-red-600 -mt-3 -mb-2">{errors.nome}</span>}

        <InputCurrency
          placeholder="Valor (R$)"
          value={valor !== null ? valor / 100 : null} // mostra em reais
          onValueChange={(val) => setValor(val !== null ? Math.round(val * 100) : null)} // salva em centavos
        />

        {confirmZero && (
          <p className="text-sm text-yellow-600">
            ⚠️ Você tem certeza que deseja salvar uma economia sem valor/meta?
          </p>
        )}
      </div>
    </BaseDialog>
  );
}
