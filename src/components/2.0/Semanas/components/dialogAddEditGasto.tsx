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
import { CreateRegistroGastoDTO, createRegistroGastoSchema, EditRegistroGastoDTO, editRegistroGastoSchema } from "@/dtos/registroGasto.schema";
import { toast } from "sonner";
import { BaseDialog } from "@/components/common/BaseDialog";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { formatDateDayMonth, formatPeriodoDayMonth } from "@/lib/formatters/formatDate";
import { formatarName } from "@/lib/formatters/formatName";


// Helpers para data
const hoje = new Date();
const ontem = new Date(hoje);
ontem.setDate(hoje.getDate() - 1);
const anteontem = new Date(hoje);
anteontem.setDate(hoje.getDate() - 2);
const amanha = new Date(hoje);
amanha.setDate(hoje.getDate() + 1);

function formatarData(data: Date) {
  if (data.toDateString() === hoje.toDateString()) return "Hoje";
  if (data.toDateString() === ontem.toDateString()) return "Ontem";
  if (data.toDateString() === anteontem.toDateString()) return "Anteontem";
  if (data.toDateString() === amanha.toDateString()) return "Amanhã";
  return format(data, "dd/MM/yyyy", { locale: ptBR });
}

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
  const [confirmCategoria, setConfirmCategoria] = useState(false);
  
  const [showConfirm, setShowConfirm] = useState<{
    message: string;
    body: (CreateRegistroGastoDTO | EditRegistroGastoDTO) & { permission?: boolean };
  } | null>(null);
  const [openCalendar, setOpenCalendar] = useState(false);

  // preencher quando for edição
  useEffect(() => {
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

 
  async function handleSalvarOuEditar() {
    if (!semanaAtual?.id && !isEdit) {
      toast.error("Nenhuma semana ativa selecionada.");
      return;
    }

    setErrors({});

    const payload = {
      name: formatarName(name.trim()),
      valorCents: valor ?? null,
      data,
      gastoId: gastoId ?? "",
      semanaId: semanaAtual?.id ?? "",
    };

    const schema = isEdit ? editRegistroGastoSchema : createRegistroGastoSchema;
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = errorMessages[path] ?? issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Confirma alteração de categoria no modo edição
    if (isEdit && currentGasto?.gastoId && currentGasto.gastoId !== parsed.data.gastoId && !confirmCategoria) {
      setConfirmCategoria(true);
      return;
    }

    if (isEdit) {
      await handleEditar(parsed.data as EditRegistroGastoDTO);
    } else {
      await handleCriar(parsed.data as CreateRegistroGastoDTO);
    }
  }

  async function handleCriar(data: CreateRegistroGastoDTO) {
    setLoading(true);
    try {
      const res = await fetch("/api/registros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        if (json?.type === "fora-ciclo") {
          toast("A data escolhida não pertence ao ciclo atual.", {
            description: `Defina uma data entre 
            ${formatPeriodoDayMonth(cicloAtual?.dataInicio, cicloAtual?.dataFim)}.`,
            style: { background: "#fee2e2", color: "#b91c1c" },
          });
        } else if (json?.type === "fora-semana") {
          setShowConfirm({
            message: json.error,
            body: { ...data, permission: true },
          });
        } else {
          toast.error(json?.error || "Erro ao salvar gasto");
        }
        return;
      }

      toast.success("Registro salvo com sucesso!", {
        style: { background: "#dcfce7", color: "#166534" },
      });

      mutateCiclo();
      handleClose();
    } catch (err) {
      console.log(err)
      toast.error( "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }


  async function handleEditar(data: EditRegistroGastoDTO) {
    if (!currentGasto?.id) {
      toast.error("Registro inválido para edição.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/registros/${currentGasto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        if (json?.type === "fora-ciclo") {
          toast("A data escolhida não pertence ao ciclo atual.", {
            description: `Defina uma data entre 
            ${formatPeriodoDayMonth(cicloAtual?.dataInicio, cicloAtual?.dataFim)}.`,
            style: { background: "#fee2e2", color: "#b91c1c" },
          });
        } else if (json?.type === "fora-semana") {
          setShowConfirm({
            message: json.error,
            body: { ...data, permission: true },
          });
        } else {
          toast.error(json?.error || "Erro ao editar gasto");
        }
        return;
      }

      toast.success("Registro alterado com sucesso!", {
        style: { background: "#dcfce7", color: "#166534" },
      });

      mutateCiclo();
      handleClose();
    } catch (err) {
      console.log(err)
      toast.error("Erro inesperado");
    } finally {
      setLoading(false);
      setConfirmCategoria(false);
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
          <Button variant={confirmCategoria ? 'danger' : 'primary'} loading={loading} onClick={handleSalvarOuEditar}>
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
                  {/* {data ? format(data, "dd/MM/yyyy", { locale: ptBR }) : "Escolha"} */}
                  {data ? formatarData(data) : <span>Escolha</span>}

                </span>
              </Button2>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={data!}
                onSelect={(d) => {
                  setTimeout(() => setOpenCalendar(false), 100);
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
      <div className="space-y-2 mt-3">
        <label className="text-base font-semibold mb-1">Selecione o tipo:</label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {metas.map((opt) => {
            return (
            <button
              key={opt.id}
              onClick={() => {
                setConfirmCategoria(false);
                setGastoId(opt.id);
              }}
              className={`border rounded-xl p-3 hover:border-blue-400 text-sm text-left ${
                gastoId === opt.id ? "border-blue-500 bg-blue-50" : ""
              }`}
            >
              <div className="font-medium text-center text-neutral-700">{opt.nome}</div>
              {/* <div className="text-xs text-gray-500">Disponível: R$ {(opt.valorDisponivelMeta / 100).toFixed(2)}</div> */}
            </button>
          )})}
        </div>
      </div>
      <div className="-mt-3">{errors.gastoId && <span className="text-xs text-red-600 mt-1">{errors.gastoId}</span>}</div>
      {/* Confirmar mudança de categoria */}
      {confirmCategoria && (
        <p className="text-sm text-yellow-600 -mt-2">
          ⚠️ Você está alterando o{" "}
          <span className="text-base font-semibold">tipo</span> deste gasto.
          Tem certeza que deseja continuar?
        </p>
      )}

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
                  if (isEdit) {

                    const res = await fetch(`/api/registros/${currentGasto?.id}`, {
                      method: "PATCH",
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
              } else {
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
                }}}
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
