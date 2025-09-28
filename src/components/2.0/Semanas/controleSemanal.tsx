"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { TipoGasto } from "@prisma/client";
import { formatPeriodoDayMonth } from "@/lib/formatters/formatDate";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Header } from "./components/header";
import { ResumoValores } from "./components/resumoValores";
import { ListagemPorCategoria } from "./components/listagemPorData";
import { DialogAddEditGasto } from "./components/dialogAddEditGasto";
import { Button } from "@/components/ui/button";

type ControleSemanalProps = {
  cicloAtual: CicloAtualDTO | null;
  mutateCiclo: () => void;
};

export default function ControleSemanal({ cicloAtual, mutateCiclo }: ControleSemanalProps) {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [semanaSelecionada, setSemanaSelecionada] = useState<string>("");
  const [currentGasto, setCurrentGasto] = useState<{
    id: string;
    name: string;
    valor: number;
    data: Date; 
    gastoId: string
  } | null>(null);

  const totalGoals =
    cicloAtual?.gastosPorMetaTotais?.reduce((acc, gasto) => acc + gasto.totalPlanejado, 0) ?? 0;

  const semanas =
    (cicloAtual?.semanas ?? []).map((semana, index) => {
      const valorGasto = semana.registros?.reduce((acc, gasto) => acc + gasto.valor, 0) ?? 0;
      const gastoAnterior = (cicloAtual?.semanas ?? [])
        .slice(0, index)
        .flatMap((s) => s.registros || [])
        .reduce((acc, gasto) => acc + gasto.valor, 0);

      const semanasRestantes = (cicloAtual?.semanas ?? []).length - index;
      const valorTotal = semanasRestantes > 0 ? Math.floor((totalGoals - gastoAnterior) / semanasRestantes) : 0;

      const gastosMeta = (cicloAtual?.gastosPorMetaTotais ?? []).map((meta) => {
        const gastoAnteriorMeta = (cicloAtual?.semanas ?? [])
          .slice(0, index)
          .flatMap((s) => s.registros || [])
          .filter((r) => r.gastoId === meta.id)
          .reduce((acc, r) => acc + r.valor, 0);

        const gastoNaSemana =
          (semana.registros || [])
            .filter((r) => r.gastoId === meta.id)
            .reduce((acc, r) => acc + r.valor, 0);

        const semanasRestantesMeta = (cicloAtual?.semanas ?? []).length - index;
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

  const gastosAgrupadosPorGoal = semanaAtual
    ? semanaAtual.gastosMeta.reduce(
        (
          acc: Record<
            string,
            {
              valorDisponivel: number;
              gastoNaSemana: number;
              datas: Record<
                string,
                {
                  id: string;
                  name: string;
                  valor: number;
                  data: Date;
                  gastoId: string;
                }[]
              >;
            }
          >,
          meta
        ) => {
          // cria sempre a categoria, mesmo sem gasto
          acc[meta.nome] = {
            valorDisponivel: meta.valorDisponivelMeta ?? 0,
            gastoNaSemana: meta.gastoNaSemana ?? 0,
            datas: {},
          };

          // preenche se houver registros
          (semanaAtual.registros || [])
            .filter((r) => r.gastoId === meta.id)
            .forEach((reg) => {
              const dataFormatada = format(new Date(reg.data), "dd/MM/yyyy", {
                locale: ptBR,
              });

              if (!acc[meta.nome].datas[dataFormatada]) {
                acc[meta.nome].datas[dataFormatada] = [];
              }

              acc[meta.nome].datas[dataFormatada].push({
                id: reg.id,
                name: reg.name,
                valor: reg.valor,
                data: reg.data,
                gastoId: reg.gastoId,
              });
            });

          return acc;
        },
        {}
      )
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

        <div className="">
          <Button
            onClick={() => setOpen(true)}
            className="w-full rounded-xl bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition mb-8"
          >
            <Plus size={16} className="mr-2" /> Adicionar gasto
          </Button>
        </div>
        {/* <GastosPorMeta semanaAtual={semanaAtual} /> */}

        <ListagemPorCategoria 
          gastosPorCategoria={gastosAgrupadosPorGoal} 
          showModal={open}
          setShowModal={setOpen}
          cicloAtual={cicloAtual}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          mutateCiclo={mutateCiclo} 
          setCurrentGasto={setCurrentGasto}
          currentGasto={currentGasto}
        />
      </div>

      <DialogAddEditGasto
        open={open}
        setOpen={setOpen}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        metas={semanaAtual?.gastosMeta || []}
        mutateCiclo={mutateCiclo}
        semanaAtual={semanaAtual}
        cicloAtual={cicloAtual}
        currentGasto={currentGasto}
      />
    </div>
  );
}
