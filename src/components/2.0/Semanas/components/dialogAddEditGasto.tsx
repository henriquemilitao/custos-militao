"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { Button as Button2 } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { InputCurrency } from "../../InputCurrency";
import { createRegistroGastoSchema } from "@/dtos/registroGasto.schema";
import { toast } from "sonner";
import { BaseDialog } from "@/components/common/BaseDialog";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { formatDateDayMonth, formatPeriodoDayMonth } from "@/lib/formatters/formatDate";
import { formatarName } from "@/lib/formatters/formatName";

type Meta = {
  id: string;
  nome: string;
  totalPlanejado: number;
  gastoNaSemana: number;
  valorDisponivelMeta: number;
};

type semanaAtual = {
  id: string;
  label: string;
  periodo: string;
  valorGasto: number;
  valorTotal: number;
  gastosMeta: Meta[];
  registros: { id: string; name: string; valor: number; data: Date; gastoId: string }[];
} | null;

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  metas: Meta[];
  mutateCiclo: () => void;
  semanaAtual: semanaAtual;
  cicloAtual?: CicloAtualDTO | null;
  isEdit: boolean;
  setIsEdit: (edit: boolean) => void;
  currentGasto?: { id: string; name: string; valor: number; data: Date; gastoId: string } | null;
};

export function DialogAddEditGasto({
  open,
  setOpen,
  metas,
  mutateCiclo,
  semanaAtual,
  cicloAtual,
  isEdit,
  setIsEdit,
  currentGasto,
}: Props) {
  const [name, setName] = useState("");
  const [valor, setValor] = useState<number | null>(null);
  const [data, setData] = useState<Date | null>(new Date());
  const [gastoId, setGastoId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; valorCents?: string; data?: string; gastoId?: string; semanaId?: string }>({});
  const [loading, setLoading] = useState(false);

  const [showConfirm, setShowConfirm] = useState<{ message: string; body: any } | null>(null);
  const [openCalendar, setOpenCalendar] = useState(false);

  // preencher quando for edição
  useEffect(() => {
    console.log({ isEdit, currentGasto });
    if (isEdit && currentGasto) {
      setName(currentGasto.name);
      setValor(currentGasto.valor);
      setData(new Date(currentGasto.data));
      setGastoId(currentGasto.gastoId);
    } else {
      setName("");
      setValor(null);
      setData(new Date());
      setGastoId(null);
    }
  }, [isEdit, currentGasto]);

  function handleClose() {
    setOpen(false);
    setIsEdit(false);
    setName("");
    setValor(null);
    setGastoId(null);
    setData(new Date());
    setErrors({});
  }

  const errorMessages: Record<string, string> = {
    gastoId: "Selecione um tipo de Gasto",
    name: "Descrição é obrigatória",
    data: "Data inválida",
    valorCents: "Digite um valor",
  };

  async function handleSalvar() {
    setLoading(true);
    setErrors({});

    const body = {
      name: formatarName(name.trim()),
      valorCents: valor,
      data,
      gastoId: gastoId ?? "",
      semanaId: semanaAtual?.id ?? "",
    };

    const parsed = createRegistroGastoSchema.safeParse(body);

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

    try {
      const res = await fetch(isEdit && currentGasto ? `/api/registros/${currentGasto.id}` : "/api/registros", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const dataRes = await res.json().catch(() => null);

      if (!res.ok) {
        if (dataRes?.type === "fora-ciclo") {
          toast("A data escolhida não pertence ao ciclo atual.", {
            description: `Defina uma data entre ${formatPeriodoDayMonth(cicloAtual?.dataInicio, cicloAtual?.dataFim)}.`,
            style: { background: "#fee2e2", color: "#b91c1c" },
          });
        } else if (dataRes?.type === "fora-semana") {
          setShowConfirm({ message: dataRes.error, body: { ...parsed.data, permission: true } });
        } else {
          toast.error(dataRes?.error || "Erro ao salvar gasto");
        }
        setLoading(false);
        return;
      }

      toast.success(isEdit ? "Gasto atualizado com sucesso!" : "Gasto adicionado com sucesso!", {
        style: { background: "#dcfce7", color: "#166534" },
      });

      mutateCiclo();
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro inesperado ao salvar gasto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
        setOpen(o);
      }}
      title={isEdit ? "Editar gasto" : "Adicionar gasto"}
      footer={
        <>
          <Button variant="secondary" disabled={loading} onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" loading={loading} onClick={handleSalvar}>
            {isEdit ? "Atualizar" : "Salvar"}
          </Button>
        </>
      }
    >
      {/* Descrição */}
      <input
        type="text"
        placeholder="Descrição"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
        }}
        className="w-full px-3 py-2 border rounded-xl focus:outline-blue-500 placeholder-gray-400 -mb-1"
      />
      {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}

      {/* Valor + Data */}
      <div className="flex gap-3 mt-3">
        <div className="flex-1 space-y-1">
          <InputCurrency
            placeholder="Valor (R$)"
            value={valor !== null ? valor / 100 : null}
            onValueChange={(val) => {
              if (errors.valorCents) setErrors((prev) => ({ ...prev, valorCents: undefined }));
              setValor(val !== null ? Math.round(val * 100) : null);
            }}
            className="-mb-1"
          />
          {errors.valorCents && <span className="text-xs text-red-600 mt-10 ">{errors.valorCents}</span>}
        </div>

        <div className="flex-1 space-y-1">
          <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
            <PopoverTrigger asChild>
              <Button2 variant="outline" className="px-3 py-2 w-full justify-start rounded-xl h-[42px]">
                <CalendarIcon className="mr-2 h-4 w-4" color="black" />
                <span className="text-black-600 font-semibold">
                  {data ? format(data, "dd/MM/yyyy", { locale: ptBR }) : "Escolha"}
                </span>
              </Button2>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={data!}
                onSelect={(d) => {
                  setTimeout(() => setOpenCalendar(false), 200);
                  d && setData(d);
                }}
                locale={ptBR}
                initialFocus
                className="p-2 text-xs"
                classNames={{
                  day_selected: "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600",
                  day_today: "border border-blue-400",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Categorias */}
      <div className="space-y-1 mt-3">
        <label className="text-base text-neutral-700 font-semibold mb-1">Selecione o tipo:</label>
        <div className="grid grid-cols-2 gap-2">
          {metas.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setGastoId(opt.id);
              }}
              className={`border rounded-xl p-3 hover:border-blue-400 text-sm text-left ${
                gastoId === opt.id ? "border-blue-500 bg-blue-50" : ""
              }`}
            >
              <div className="font-medium">{opt.nome}</div>
              <div className="text-xs text-gray-500">Disponível: R$ {(opt.valorDisponivelMeta / 100).toFixed(2)}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="-mt-3">{errors.gastoId && <span className="text-xs text-red-600 mt-1">{errors.gastoId}</span>}</div>
    </BaseDialog>
  );
}
