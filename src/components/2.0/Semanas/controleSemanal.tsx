"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { formatPeriodoDayMonth } from "@/lib/formatters/formatDate";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  CategoriAgrupada,
  Header,
  RegistroGasto,
} from "./components/header";
import { ResumoValores } from "./components/resumoValores";
import { ListagemPorCategoria } from "./components/listagemPorData";
import { DialogAddEditGasto } from "./components/dialogAddEditGasto";
import { Button } from "@/components/ui/button";
import { PersonilazedDialog } from "@/components/common/personalized-dialog";

type ControleSemanalProps = {
  cicloAtual: CicloAtualDTO | null;
  mutateCiclo: () => void;
};

export default function ControleSemanal({
  cicloAtual,
  mutateCiclo,
}: ControleSemanalProps) {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [semanaSelecionada, setSemanaSelecionada] = useState<string>("");
  const [showModalSemCiclo, setShowModalSemCiclo] = useState(false);
  const [currentGasto, setCurrentGasto] = useState<RegistroGasto | null>(null);

  const totalGoals =
    cicloAtual?.gastosPorMetaTotais?.reduce(
      (acc, gasto) => acc + gasto.totalPlanejado,
      0
    ) ?? 0;

  const semanas =
    (cicloAtual?.semanas ?? []).map((semana, index) => {
      const valorGasto =
        semana.registros?.reduce((acc, gasto) => acc + gasto.valor, 0) ?? 0;
      const gastoAnterior = (cicloAtual?.semanas ?? [])
        .slice(0, index)
        .flatMap((s) => s.registros || [])
        .reduce((acc, gasto) => acc + gasto.valor, 0);

      // Nova lógica progressiva
      let valorTotal: number;
      if (index === 0) {
        valorTotal = Math.floor(totalGoals / 4.5);
      } else if (index === 1) {
        valorTotal = Math.floor((totalGoals - gastoAnterior) / 3.5);
      } else if (index === 2) {
        valorTotal = Math.floor((totalGoals - gastoAnterior) / 2.5);
      } else {
        valorTotal = totalGoals - gastoAnterior;
      }

      const gastosMeta =
        (cicloAtual?.gastosPorMetaTotais ?? []).map((meta) => {
          const gastoAnteriorMeta = (cicloAtual?.semanas ?? [])
            .slice(0, index)
            .flatMap((s) => s.registros || [])
            .filter((r) => r.gastoId === meta.id)
            .reduce((acc, r) => acc + r.valor, 0);

          const gastoNaSemana =
            (semana.registros || [])
              .filter((r) => r.gastoId === meta.id)
              .reduce((acc, r) => acc + r.valor, 0);

          let valorDisponivelMeta: number;
          if (index === 0) {
            valorDisponivelMeta = Math.floor(meta.totalPlanejado / 4.5);
          } else if (index === 1) {
            valorDisponivelMeta = Math.floor(
              (meta.totalPlanejado - gastoAnteriorMeta) / 3.5
            );
          } else if (index === 2) {
            valorDisponivelMeta = Math.floor(
              (meta.totalPlanejado - gastoAnteriorMeta) / 2.5
            );
          } else {
            valorDisponivelMeta = meta.totalPlanejado - gastoAnteriorMeta;
          }

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
        dataInicio: new Date(semana.dataInicio),
        dataFim: new Date(semana.dataFim),
      };
    }) || [];

  const semanaAtual =
    semanas.find((s) => s.id === semanaSelecionada) || null;

  // Selecionar a semana do dia atual
  useEffect(() => {
    if (semanas.length > 0 && !semanaSelecionada) {
      const hoje = new Date();

      const semanaDoHoje = semanas.find(
        (s) => hoje >= s.dataInicio && hoje <= s.dataFim
      );

      setSemanaSelecionada(
        semanaDoHoje ? semanaDoHoje.id : semanas[0].id
      );
    }
  }, [semanas, semanaSelecionada]);

  const gastosAgrupadosPorGoal: Record<string, CategoriAgrupada> = semanaAtual
    ? semanaAtual.gastosMeta.reduce(
        (acc: Record<string, CategoriAgrupada>, meta) => {
          acc[meta.nome] = {
            valorDisponivel: meta.valorDisponivelMeta ?? 0,
            gastoNaSemana: meta.gastoNaSemana ?? 0,
            datas: {},
          };

          (semanaAtual.registros || [])
            .filter((r) => r.gastoId === meta.id)
            .forEach((reg) => {
              const dataFormatada = format(
                new Date(reg.data),
                "dd/MM/yyyy",
                { locale: ptBR }
              );

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

        <div>
          <Button
            onClick={() => {
              if (!cicloAtual?.id) {
                setShowModalSemCiclo(true);
                return;
              }
              setOpen(true);
            }}
            className="w-full rounded-xl bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition mb-8"
          >
            <Plus size={16} className="mr-2" /> Adicionar gasto
          </Button>
        </div>

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

      <PersonilazedDialog
        open={showModalSemCiclo}
        onOpenChange={setShowModalSemCiclo}
        title="Valor indisponível"
        description="Você precisa adicionar quanto você recebe nesse mês para começar a adicionar seus gastos."
      />
    </div>
  );
}
