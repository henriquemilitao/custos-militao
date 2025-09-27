"use client";

import { useEffect, useState } from "react";
import { BaseDialog } from "@/components/common/BaseDialog";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { toast } from "sonner";
import { Gasto } from "@prisma/client";
import { InputCurrency } from "../../InputCurrency";
import { Button } from "@/components/common/Button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState<number | null>(null);
  const [data, setData] = useState<Date>(new Date());
  const [confirmZero, setConfirmZero] = useState(false);
  const [errors, setErrors] = useState<{ nome?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && gasto) {
      setNome(gasto.name);
      setValor(gasto.valor);
    //   setData(new Date(gasto.));
    } else {
      setNome("");
      setValor(null);
      setData(new Date());
    }
  }, [isEdit, gasto, showModal]);

  function handleClose() {
    setShowModal(false);
    setNome("");
    setValor(null);
    setData(new Date());
    setConfirmZero(false);
    setErrors({});
  }

  async function handleSalvarOuEditar() {
    if (!cicloAtual?.id) {
      toast.error("Nenhum ciclo ativo selecionado.");
      return;
    }

    if (!nome.trim()) {
      setErrors({ nome: "Descrição é obrigatória" });
      return;
    }

    if ((valor === null || valor === 0) && !confirmZero) {
      setConfirmZero(true);
      return;
    }

    setLoading(true);
    try {
      const body = {
        name: formatarName(nome.trim()),
        valor: Math.round(valor ?? 0),
        data,
        cicloId: cicloAtual.id,
      };

      const url = isEdit ? `/api/gastos/${gasto?.id}` : "/api/gastos";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const dataRes = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(dataRes?.error || "Erro desconhecido");
        return;
      }

      toast.success(
        isEdit ? "Gasto atualizado com sucesso!" : "Gasto salvo com sucesso!",
        {
          style: { background: "#dcfce7", color: "#166534" },
        }
      );
      mutateCiclo();
      handleClose();
      setIsEdit(false);
    } catch {
      toast.error("Não foi possível salvar o gasto");
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
          setShowModal(false);
        } else {
          setShowModal(true);
        }
      }}
      title={!isEdit ? "Novo Gasto" : "Editar Gasto"}
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
        {/* Nome */}
        <input
          type="text"
          placeholder="Descrição do gasto"
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            if (errors.nome) {
              setErrors((prev) => ({ ...prev, nome: undefined }));
            }
          }}
          className="w-full px-3 py-2 border rounded-xl focus:outline-blue-500 placeholder-gray-400"
        />
        {errors.nome && (
          <span className="text-xs text-red-600 -mt-3 -mb-2">{errors.nome}</span>
        )}

        {/* Valor */}
        <InputCurrency
          placeholder="Valor (R$)"
          value={valor !== null ? valor / 100 : null}
          onValueChange={(val) =>
            setValor(val !== null ? Math.round(val * 100) : null)
          }
        />

        {/* Data */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Data</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button className="justify-start rounded-xl">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(data, "dd/MM/yyyy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={data}
                onSelect={(d) => d && setData(d)}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {confirmZero && (
          <p className="text-sm text-yellow-600">
            ⚠️ Você tem certeza que deseja salvar um gasto sem{" "}
            <span className="font-semibold">valor?</span>
          </p>
        )}
      </div>
    </BaseDialog>
  );
}
