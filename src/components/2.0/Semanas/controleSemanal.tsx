"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { TipoGasto } from "@prisma/client";
import { formatPeriodoDayMonth } from "@/lib/formatters/formatDate";
import { formatCurrencyFromCents } from "@/lib/formatters/formatCurrency";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Header } from "./components/header";
import { ResumoValores } from "./components/resumoValores";
import { GastosPorMeta } from "./components/gastosPorMeta";
import { ListagemPorData } from "./components/listagemPorData";
import { DialogAddGasto } from "./components/dialogAddGasto";
import { Button } from "@/components/ui/button";

type ControleSemanalProps = {
  cicloAtual: CicloAtualDTO | null;
  mutateCiclo: () => void;
};

export default function ControleSemanal({ cicloAtual, mutateCiclo }: ControleSemanalProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Date | null>(new Date());
  const [semanaSelecionada, setSemanaSelecionada] = useState<string>("");

  const totalGoals =
    cicloAtual?.gastosPorMetaTotais?.reduce((acc, gasto) => acc + gasto.totalPlanejado, 0) ?? 0;

  const semanas =
    cicloAtual?.semanas.map((semana, index) => {
      const valorGasto = semana.registros?.reduce((acc, gasto) => acc + gasto.valor, 0) ?? 0;
      const gastoAnterior = cicloAtual.semanas
        .slice(0, index)
        .flatMap((s) => s.registros || [])
        .reduce((acc, gasto) => acc + gasto.valor, 0);

      const semanasRestantes = cicloAtual.semanas.length - index;
      const valorTotal = semanasRestantes > 0 ? Math.floor((totalGoals - gastoAnterior) / semanasRestantes) : 0;

      const gastosMeta = cicloAtual.gastosPorMetaTotais.map((meta) => {
        const gastoAnteriorMeta = cicloAtual.semanas
          .slice(0, index)
          .flatMap((s) => s.registros || [])
          .filter((r) => r.gastoId === meta.id)
          .reduce((acc, r) => acc + r.valor, 0);

        const gastoNaSemana =
          (semana.registros || [])
            .filter((r) => r.gastoId === meta.id)
            .reduce((acc, r) => acc + r.valor, 0);

        const semanasRestantesMeta = cicloAtual.semanas.length - index;
        const valorDisponivelMeta =
          semanasRestantesMeta > 0
            ? Math.floor((meta.totalPlanejado - gastoAnteriorMeta) / semanasRestantesMeta)
            : 0;

        return {
          id: meta.id,
          nome: meta.name,
          totalPlanejado: meta.totalPlanejado,
          gastoNaSemana,
          gastoAnteriorMeta,
          valorDisponivelMeta,
        };
      });

      return {
        id: semana.id,
        label: `Semana ${semana.qualSemanaCiclo}`,
        periodo: formatPeriodoDayMonth(semana.dataInicio, semana.dataFim),
        valorGasto,
        valorTotal,
        gastosMeta,
        registros: semana.registros,
      };
    }) || [];

  const semanaAtual = semanas.find((s) => s.id === semanaSelecionada) || null;

  useEffect(() => {
    if (semanas.length > 0 && !semanaSelecionada) {
      setSemanaSelecionada(semanas[0].id);
    }
  }, [semanas, semanaSelecionada]);

  const gastosPorData = semanaAtual
    ? semanaAtual?.registros.reduce((acc: Record<string, { nome: string; valor: number }[]>, reg) => {
        const dataFormatada = format(new Date(reg.data), "dd/MM/yyyy", { locale: ptBR });
        if (!acc[dataFormatada]) acc[dataFormatada] = [];
        acc[dataFormatada].push({ nome: reg.name, valor: reg.valor });
        return acc;
      }, {})
    : {};

  return (
    <div className="p-4 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-4 mb-4 flex flex-col">
        <Header
          semanaAtual={semanaAtual}
          semanaSelecionada={semanaSelecionada}
          setSemanaSelecionada={setSemanaSelecionada}
          semanas={semanas}
        />

        <ResumoValores semanaAtual={semanaAtual} />

        <GastosPorMeta semanaAtual={semanaAtual} />

        <ListagemPorData gastosPorData={gastosPorData} />

        <div className="mt-10">
          <Button
            onClick={() => setOpen(true)}
            className="w-full rounded-xl bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition"
          >
            <Plus size={16} className="mr-2" /> Adicionar gasto
          </Button>
        </div>
      </div>

      <DialogAddGasto open={open} setOpen={setOpen} data={data} setData={setData} />
    </div>
  );
}
