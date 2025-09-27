"use client";

import { useState } from "react";
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
import { permission } from "process";
import { set } from "zod";

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
  registros: { id: string; name: string; valor: number; data: Date }[];
} | null;

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  metas: Meta[];
  mutateCiclo: () => void;
  semanaAtual: semanaAtual;
  cicloAtual?: CicloAtualDTO | null;
};

export function DialogAddGasto({ open, setOpen, metas, mutateCiclo, semanaAtual, cicloAtual }: Props) {
  const [name, setName] = useState("");
  const [valor, setValor] = useState<number | null>(null);
  const [data, setData] = useState<Date | null>(new Date());
  const [gastoId, setGastoId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; valorCents?: string; data?: string; gastoId?: string; semanaId?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState<{
    message: string;
    body: any;
  } | null>(null);
  const [openCalendar, setOpenCalendar] = useState(false);


  const hoje = new Date();
  const ontem = new Date(hoje); ontem.setDate(hoje.getDate() - 1);
  const amanha = new Date(hoje); amanha.setDate(hoje.getDate() + 1);
  const anteontem = new Date(hoje); anteontem.setDate(hoje.getDate() - 2);

  function handleClose() {
    setOpen(false);
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
      const res = await fetch("/api/registros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const dataRes = await res.json().catch(() => null);

      if (!res.ok) {
        if (dataRes?.type === "fora-ciclo") {
          // ❌ não permite continuar
          // toast.error(dataRes.error || "A data não pertence ao ciclo atual.");
          toast("A data escolhida não pertence ao ciclo atual.", {
                    description: `Defina uma data entre 
                    ${formatPeriodoDayMonth(cicloAtual?.dataInicio, cicloAtual?.dataFim)}.`,
                    style: { background: "#fee2e2", color: "#b91c1c" },
                  });
        } else if (dataRes?.type === "fora-semana") {
          // ⚠️ abre modal de confirmação
          setShowConfirm({
            message: dataRes.error,
            body: {... parsed.data, permission: true},
          });
        } else {
          toast.error(dataRes?.error || "Erro ao salvar gasto");
        }
        setLoading(false);
        return;
      }

      toast.success("Gasto adicionado com sucesso!", {
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
      title="Adicionar gasto"
      footer={
        <>
          <Button
            variant="secondary"
            disabled={loading}
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            loading={loading}
            onClick={handleSalvar}
          >
            Salvar
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
              <Button2
                variant="outline"
                className="px-3 py-2 w-full justify-start rounded-xl h-[42px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" color="black" />
                <span className="text-black-600 font-semibold">
                  {data ? (
                    data.toDateString() === hoje.toDateString()
                      ? "Hoje"
                      : data.toDateString() === ontem.toDateString()
                      ? "Ontem"
                      : data.toDateString() === anteontem.toDateString()
                      ? "Anteontem"
                      : data.toDateString() === amanha.toDateString()
                      ? "Amanhã"
                      : format(data, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Escolha</span>
                  )}
                </span>
              </Button2>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={data!}
                onSelect={(d) => {
                  setTimeout(() => {
                    setOpenCalendar(false)
                   }, 200);
                  d && setData(d)
                }}
                locale={ptBR}
                initialFocus
                className="p-2 text-xs" // deixa o calendário um pouco menor
                classNames={{
                  day_selected:
                    "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600", // azul no dia selecionado
                  day_today: "border border-blue-400", // destaca o dia atual
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Categorias */}
      <div className="space-y-1">
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
              <div className="text-xs text-gray-500">
                Disponível: R$ {(opt.valorDisponivelMeta / 100).toFixed(2)}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="-mt-3">
        {errors.gastoId && <span className="text-xs text-red-600 mt-1">{errors.gastoId}</span>}
      </div>


      {showConfirm && (
        <BaseDialog
          open={true}
          onOpenChange={() => setShowConfirm(null)}
          title="Data de outra semana"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowConfirm(null)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  const res = await fetch("/api/registros", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(showConfirm.body),
                  });
                  if (res.ok) {
                    toast.success(`Gasto adicionado com sucesso na semana do dia ${formatDateDayMonth(data)}`, {
                      style: { background: "#dcfce7", color: "#166534" },
                    });
                    mutateCiclo();
                    handleClose();
                  } else {
                    toast.error("Erro ao adicionar gasto");
                  }
                  setShowConfirm(null);
                }}
              >
                Continuar
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            {/* Destaque em vermelho/amarelo */}
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-300 text-sm text-yellow-800 flex items-start gap-2">
              <span className="text-yellow-600 text-lg">⚠️</span>
              <div>
                <p className="font-semibold">Atenção!</p>
                <p>{showConfirm.message}</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">
              Se você confirmar, o gasto será automaticamente adicionado{" "}
              <strong className="text-blue-600">na semana correspondente ao dia
                <strong className="text-blue-800 text-sm">
                 {''} {formatDateDayMonth(data)}
                </strong>
              </strong>.
            </p>
          </div>
        </BaseDialog>
      )}


    </BaseDialog>
  );
}
