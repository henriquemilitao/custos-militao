"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Button as Button2 } from "@/components/common/Button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { InputCurrency } from "../../InputCurrency";
import { useState } from "react";
import { createRegistroGastoSchema } from "@/dtos/registroGasto.schema";
import { toast } from "sonner";

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
  metas: Meta[]; // vem do ControleSemanal
  mutateCiclo: () => void; // <- novo
  semanaAtual: semanaAtual;
};

export function DialogAddGasto({ open, setOpen, metas, mutateCiclo, semanaAtual }: Props) {
  const [name, setName] = useState("");
  const [valor, setValor] = useState<number | null>(null); // em centavos
  const [confirmZero, setConfirmZero] = useState(false);
  const [data, setData] = useState<Date | null>(new Date());
  const [tipoGastoId, setTipoCategoriaGasto] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; valorCents?: string; data?: string; tipoGastoId?: string; semanaId?: string }>({});
  const [loading, setLoading] = useState(false);

  const hoje = new Date();
  const ontem = new Date(hoje); ontem.setDate(hoje.getDate() - 1);
  const amanha = new Date(hoje); amanha.setDate(hoje.getDate() + 1);
  const anteontem = new Date(hoje); anteontem.setDate(hoje.getDate() - 2);

  function handleClose() {
      setOpen(false);
      setName("");
      setValor(null);
      setTipoCategoriaGasto(null);
      setErrors({});
  }

  async function handleSalvar() {

    if (!name.trim()) {
      setErrors({ name: "Nome é obrigatório" });
      return;
    }

    if ((valor === null || valor === 0) && !confirmZero) {
      setConfirmZero(true);
      return;
    }

    if (!data){
      setErrors({ data: "Selecione uma Data"})
      return;
    }

    if (!tipoGastoId){
      setErrors({ tipoGastoId: "Selecione uma Categoria"})
      return;
    }
    setLoading(true);
    
    try {
      const body = {
        name: name.trim(),
        valorCents: valor,
        data,
        gastoId: tipoGastoId, // ← categoria escolhida
        semanaId: semanaAtual?.id, // precisa vir de props ou contexto
      };

      const res = await fetch("/api/registros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const dataRes = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(dataRes?.error || "Erro ao salvar gasto");
        return;
      }

      toast.success("Gasto adicionado com sucesso!", {
        style: {
          background: "#dcfce7",
          color: "#166534",
        },
      });

      mutateCiclo();
      handleClose();
    } catch (err) {
      toast.error("Erro inesperado ao salvar");
    } finally {
      setLoading(false);
    }
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Adicionar gasto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Descrição */}
          <div className="space-y-1">
            <label className="text-base text-neutral-700">Descrição</label>
            <input
              placeholder="Com o que você gastou?"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setConfirmZero(false)
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className="block w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 -mb-1"
            />
            {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
          </div>

          {/* Valor + Data */}
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-base text-neutral-700">Valor</label>
              <InputCurrency
                placeholder="R$ 0,00"
                value={valor !== null ? valor / 100 : null}
                onValueChange={(val) => {
                  setConfirmZero(false)
                  setValor(val !== null 
                  ? Math.round(val * 100) 
                  : null)
                }}
                className="block w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.valorCents && <span className="text-xs text-red-600">{errors.valorCents}</span>}

            </div>

            <div className="flex-1 space-y-1">
              <label className="text-base text-neutral-700">Data</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
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
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={data!}
                    onSelect={(d) => d && setData(d)}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Categorias */}
          <div className="space-y-1">
            <label className="text-base text-neutral-700">Categoria</label>
            <div className="grid grid-cols-2 gap-2">
            {metas.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setConfirmZero(false)
                  setTipoCategoriaGasto(opt.id)
                }}
                className={`border rounded-xl p-3 hover:border-blue-400 text-sm text-left ${
                  tipoGastoId === opt.id ? "border-blue-500 bg-blue-50" : ""
                }`}
              >
                <div className="font-medium">{opt.nome}</div>
                <div className="text-xs text-gray-500">
                  Disponível: R$ {(opt.valorDisponivelMeta / 100).toFixed(2)}
                </div>
              </button>
            ))}
          </div>
          {errors.tipoGastoId && <span className="text-xs text-red-600">{errors.tipoGastoId}</span>}

          </div>
        </div>

        {confirmZero && (
          <p className="text-sm text-yellow-600 -mb-4">
            ⚠️ Você tem certeza que deseja salvar um gasto sem <span className="text-base font-semibold">valor?</span>
          </p>
        )}

        <DialogFooter className="mt-4 flex flex-row justify-end gap-2">
          <Button2
            variant="secondary"
            className="px-3 py-1 rounded-xl border"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button2>
          <Button2
            className="px-4 py-2 rounded-xl bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition"
            onClick={handleSalvar}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button2>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
