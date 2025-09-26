// components/economias/components/dialogCreateEditGasto.tsx
"use client";

import { useEffect, useState } from "react";
import { BaseDialog } from "@/components/common/BaseDialog";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { toast } from "sonner";
import { Gasto, Prisma, TipoGasto } from "@prisma/client";
import { InputCurrency } from "../../InputCurrency";
import { Button } from "@/components/common/Button";
import { TipoGastoSelect } from "../../testeTipoGastoSelect";
import { DialogBlockTipoChange } from "./dialogBlockTipoChange";
import { DialogAvisoMigracaoTipoChange } from "./dialogAvisoMigracaoTipoChange";
import { formatDateShort } from "@/lib/formatters/formatDate";

type DialogCreateEditGastoProps = {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  cicloAtual: CicloAtualDTO | null;
  mutateCiclo: () => void; // <- novo
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
  const [valor, setValor] = useState<number | null>(null); // cents
  const [confirmZero, setConfirmZero] = useState(false);
  const [errors, setErrors] = useState<{ name?: string, tipoGasto?: string } >({});
  const [loading, setLoading] = useState(false);
  const [tipoGasto, setTipoGasto] = useState<TipoGasto | null>(null)
  // dentro do componente DialogCreateEditGasto
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
      setTipoGasto(null)
    }
  }, [isEdit, gasto, showModal]);

  function handleClose() {
    setShowModal(false);
    setName("");
    setValor(null);
    setTipoGasto(null)
    setConfirmZero(false);
    setErrors({});
  }

  async function handleSalvar() {
    if (!cicloAtual?.id) {
      toast.error("Nenhum ciclo ativo selecionado.");
      return;
    }

    if (!name.trim()) {
      setErrors({ name: "name é obrigatório" });
      return;
    }

    if (!tipoGasto){
      setErrors({ tipoGasto: "Selecione um Tipo de Gasto"})
      return;
    }

    if ((valor === null || valor === 0) && !confirmZero) {
      setConfirmZero(true);
      return;
    }

    setLoading(true);
    try {
      const body = { nome: name.trim(), valorCents: Math.round(valor ?? 0), cicloId: cicloAtual.id, tipoGasto: tipoGasto};

      const res = await fetch("/api/gastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error || "Erro desconhecido");
        return;
      }

      toast.success("Gasto salvo com sucesso!", {
        style: {
          background: "#dcfce7", // verdinho claro
          color: "#166534", // texto verde escuro
        },
      });
      mutateCiclo();

      handleClose();
      setIsEdit(false);
    } catch (err) {
      toast.error("Não foi possível salvar seu gasto");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditar() {
    if (!cicloAtual?.id) {
      toast.error("Nenhum ciclo ativo selecionado.");
      return;
    }

    if (!name.trim()) {
      setErrors({ name: "Nome é obrigatório" });
      return;
    }

    if ((valor === null || valor === 0) && !confirmZero) {
      setConfirmZero(true);
      return;
    }

    if (!tipoGasto){
      setErrors({ tipoGasto: "Selecione um Tipo de Gasto"})
      return;
    }

    const jaTevePagamentosNoMes = cicloAtual?.gastosPorMetaTotais.find(
      (gastoMeta) => gastoMeta.id === gasto?.id
    );

    const tevePagamento = (jaTevePagamentosNoMes?.totalJaGasto ?? 0) > 0;
    const tipoAlterado = gasto?.tipo !== tipoGasto;

    // Recorrente -> Único já com registros
    if (!forcarMigracao && tevePagamento && tipoAlterado) {
      setShowBlockModal(true);
      return;
    }

    // Único -> Recorrente já pago
    if (!forcarMigracao && gasto?.isPago && tipoAlterado) {
      setShowAvisoMigracaoModal(true);
      return;
    }

    setLoading(true);
    try {
      const body = { name: name.trim(), valorCents: Math.round(valor ?? 0), tipoGasto };

      const res = await fetch(`/api/gastos/${gasto?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error || "Erro desconhecido");
        return;
      }

      toast.success("Gasto alterado com sucesso!", {
        style: {
          background: "#dcfce7",
          color: "#166534",
        },
      });
      mutateCiclo();

      handleClose();
      setIsEdit(false);
    } catch (err) {
      toast.error("Não foi possível editar seu gasto");
    } finally {
      setLoading(false);
      setForcarMigracao(false)
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
      title={!isEdit ? "Novo Gasto" : "Editar Gasto"}
      footer={
        <>
          <Button variant="secondary" disabled={loading} 
              onClick={() => {
                handleClose();
                setIsEdit(false);
              }}>
              Cancelar
          </Button>
          <Button variant={confirmZero ? 'danger' : 'primary'} 
            loading={loading} 
              onClick={isEdit ? handleEditar : handleSalvar}
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
            if (errors.name) {
              setErrors((prev) => ({ ...prev, name: undefined }));
            }
          }}
          className="w-full px-3 py-2 border rounded-xl focus:outline-blue-500 placeholder-gray-400"
        />
        {errors.name && <span className="text-xs text-red-600 -mt-3 -mb-2">{errors.name}</span>}

        <InputCurrency
          placeholder="Valor (R$)"
          value={valor !== null ? valor / 100 : null} // mostra em reais
          onValueChange={(val) => setValor(val !== null ? Math.round(val * 100) : null)} // salva em centavos
        />

        <TipoGastoSelect tipoGasto={tipoGasto} setTipoGasto={setTipoGasto} setErrors={setErrors} gasto={gasto} isEdit={isEdit}/>
        {errors.tipoGasto && <span className="text-xs font-semibold text-red-600 -mt-7 -mb-2">{errors.tipoGasto}</span>}
        
        {confirmZero && (
          <p className="text-sm text-yellow-600 -mt-5 -mb-4">
            ⚠️ Você tem certeza que deseja salvar um gasto sem <span className="text-base font-semibold">valor/meta?</span>
          </p>
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
          handleEditar();
        }}
        dataPago={gasto?.dataPago ? formatDateShort(gasto?.dataPago) : undefined}
      />
    </BaseDialog>
  );
}
