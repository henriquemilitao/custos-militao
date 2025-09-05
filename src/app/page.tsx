"use client";

import { useEffect, useMemo, useState } from "react";
import ConfigMes from "@/components/ConfigMes";
import ConfigEconomia, { Economia as EconomiaType } from "@/components/ConfigEconomia";
import EconomiaItem from "@/components/EconomiaItem";
import CategoriaFixa from "@/components/CategoriaFixa";
import Aleatorio from "@/components/Aleatorio";
import ResumoMes from "@/components/ResumoMes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConfigGastoFixo from "@/components/ConfigGastoFixo";

export type CategoriaFixaType = {
  id: string;
  nome: string;
  meta: number;
  pago: boolean;
};

export type GastoGasolina = {
  id: string;
  data: string;
  valor: number;
};

export type GastoItem = {
  id: string;
  descricao: string;
  valor: number;
  dataPtBr: string;
};

export type Economia = EconomiaType;

export type EstadoMes = {
  mesId: string;
  saldoInicial: number;
  categorias: CategoriaFixaType[];
  economias: Economia[];
  aleatorioMeta: number;
  aleatorioSemanas: [GastoItem[], GastoItem[], GastoItem[], GastoItem[]];
  aleatorioFechadas: [boolean, boolean, boolean, boolean];
  aleatorioQuotaFixas: [number | null, number | null, number | null, number | null];
  gasolinaGastos: GastoGasolina[];
};

type MapMeses = Record<string, EstadoMes>;

const LS_KEY = "budget-planner-v2";

function yyyymm(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function load(): MapMeses {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, Partial<EstadoMes>>) : {};

    const migrated: MapMeses = {};
    for (const k of Object.keys(parsed)) {
      const v = parsed[k]!;

      const saldoInicial = Number(v.saldoInicial ?? 1200);
      const economias = (v.economias ?? []) as Economia[];

      // 🔹 garante que a reserva exista com 10% do saldo inicial
      const hasReserva = economias.some((e) => e.titulo === "Reserva de Emergência");
      if (!hasReserva) {
        economias.unshift({
          id: crypto.randomUUID(),
          titulo: "Reserva de Emergência",
          meta: saldoInicial * 0.1,
          economizado: false,
        });
      }

      migrated[k] = {
        mesId: v.mesId ?? k,
        saldoInicial,
        categorias: v.categorias ?? [],
        economias,
        aleatorioMeta: Number(v.aleatorioMeta ?? 400),
        aleatorioSemanas: (v.aleatorioSemanas as EstadoMes["aleatorioSemanas"]) ?? [[], [], [], []],
        aleatorioFechadas: (v.aleatorioFechadas as EstadoMes["aleatorioFechadas"]) ?? [false, false, false, false],
        aleatorioQuotaFixas: (v.aleatorioQuotaFixas as EstadoMes["aleatorioQuotaFixas"]) ?? [null, null, null, null],
        gasolinaGastos: (v.gasolinaGastos as GastoGasolina[]) ?? [],
      };
    }
    return migrated;
  } catch {
    return {};
  }
}

function save(map: MapMeses) {
  localStorage.setItem(LS_KEY, JSON.stringify(map));
}

export default function Page() {
  const mesHoje = useMemo(() => yyyymm(new Date()), []);
  const [map, setMap] = useState<MapMeses>({});
  const [mes, setMes] = useState<string>(mesHoje);

  useEffect(() => {
    const m = load();
    if (!m[mesHoje]) {
      m[mesHoje] = {
        mesId: mesHoje,
        saldoInicial: 1200,
        categorias: [
          { id: crypto.randomUUID(), nome: "Gasolina", meta: 0, pago: false },
          { id: crypto.randomUUID(), nome: "Cabeleireiro", meta: 120, pago: false },
          { id: crypto.randomUUID(), nome: "Comida", meta: 600, pago: false },
        ],
        economias: [
          {
            id: crypto.randomUUID(),
            titulo: "Reserva de Emergência",
            meta: 120, // 10% de 1200
            economizado: false,
          },
        ],
        aleatorioMeta: 400,
        aleatorioSemanas: [[], [], [], []],
        aleatorioFechadas: [false, false, false, false],
        aleatorioQuotaFixas: [null, null, null, null],
        gasolinaGastos: [],
      };
    }
    setMap(m);
  }, [mesHoje]);

  useEffect(() => {
    if (Object.keys(map).length) save(map);
  }, [map]);

  const estado = map[mes];

  function atualizarMes(patch: Partial<EstadoMes>) {
    setMap((old) => ({
      ...old,
      [mes]: {
        ...(old[mes] ?? {
          mesId: mes,
          saldoInicial: 0,
          categorias: [],
          economias: [],
          aleatorioMeta: 0,
          aleatorioSemanas: [[], [], [], []],
          aleatorioFechadas: [false, false, false, false],
          aleatorioQuotaFixas: [null, null, null, null],
          gasolinaGastos: [],
        }),
        ...patch,
      },
    }));
  }

  if (!estado) {
    return <main className="p-6">Carregando…</main>;
  }

  // 🔹 Categorias Fixas
  function handleAdicionarGastoFixo(nova: Omit<CategoriaFixaType, "id" | "pago">) {
    atualizarMes({
      categorias: [
        ...estado.categorias,
        { id: crypto.randomUUID(), nome: nova.nome, meta: nova.meta, pago: false },
      ],
    });
  }

  function handleEditarCategoria(id: string, dados: { nome: string; meta: number }) {
    atualizarMes({
      categorias: estado.categorias.map((c) =>
        c.id === id ? { ...c, nome: dados.nome, meta: dados.meta } : c
      ),
    });
  }

  // 🔹 Economias
  function handleAdicionarEconomia(nova: Omit<Economia, "id" | "economizado">) {
    const isReserva = nova.titulo === "Reserva de Emergência";
    const metaCorrigida = isReserva
      ? (estado.saldoInicial > 0 ? estado.saldoInicial * 0.1 : 0)
      : nova.meta;

    atualizarMes({
      economias: [
        ...estado.economias,
        { id: crypto.randomUUID(), titulo: nova.titulo, meta: metaCorrigida, economizado: false },
      ],
    });
  }

  function handleEditarEconomia(id: string, dados: { titulo: string; meta: number }) {
    const isReserva = dados.titulo === "Reserva de Emergência";
    const metaCorrigida = isReserva
      ? (estado.saldoInicial > 0 ? dados.meta : 0)
      : dados.meta;

    atualizarMes({
      economias: estado.economias.map((e) =>
        e.id === id ? { ...e, titulo: dados.titulo, meta: metaCorrigida } : e
      ),
    });
  }

  function handleRemoverEconomia(id: string) {
    atualizarMes({
      economias: estado.economias.filter((e) => e.id !== id),
    });
  }

  function handleToggleEconomia(id: string) {
    atualizarMes({
      economias: estado.economias.map((e) =>
        e.id === id ? { ...e, economizado: !e.economizado } : e
      ),
    });
  }

  // 🔹 Totais
  const totalPlanejadoFixas = estado.categorias.reduce((s, c) => s + c.meta, 0);
  const totalEconomias = estado.economias.reduce((acc, e) => acc + e.meta, 0);
  const aleatorioMeta = estado.saldoInicial - totalEconomias - totalPlanejadoFixas;

  // soma os pagos "normais" (exceto gasolina)
  const gastoFixasNormais = estado.categorias
    .filter((c) => c.nome.toLowerCase() !== "gasolina")
    .reduce((s, c) => s + (c.pago ? c.meta : 0), 0);

  // soma os abastecimentos de gasolina
  const gastoGasolina = estado.gasolinaGastos.reduce((s, g) => s + g.valor, 0);

  // total final
  const gastoFixas = gastoFixasNormais + gastoGasolina;

  const gastoAleatorio = estado.aleatorioSemanas.flat().reduce((s, it) => s + it.valor, 0);

  return (
    <main className="min-h-screen bg-neutral-50">
      <ResumoMes
        saldoInicial={estado.saldoInicial}
        economias={estado.economias.map((e) => ({
          meta: e.meta,
          guardado: e.economizado ? e.meta : 0,
        }))}
        gastoFixas={gastoFixas}
        gastoAleatorio={gastoAleatorio}
        totalPlanejadoFixas={totalPlanejadoFixas}
        aleatorioMeta={aleatorioMeta}
        onUpdateSaldoInicial={(novo) => atualizarMes({ saldoInicial: novo })}
      />

      <Card className="rounded-2xl shadow-sm mx-4">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Economias</CardTitle>
          <ConfigEconomia onAdicionar={handleAdicionarEconomia} />
        </CardHeader>
        <CardContent className="space-y-3">
          {estado.economias.length === 0 ? (
            <div className="text-base text-neutral-500">Nenhuma economia adicionada.</div>
          ) : (
            estado.economias.map((eco) => (
              <EconomiaItem
                key={eco.id}
                economia={eco}
                onToggle={() => handleToggleEconomia(eco.id)}
                onRemove={() => handleRemoverEconomia(eco.id)}
                onSalvarEdit={handleEditarEconomia}
                totalDisponivel={estado.saldoInicial}
              />
            ))
          )}
        </CardContent>
      </Card>

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Gastos Fixos</CardTitle>
              <ConfigGastoFixo
                onAdicionar={handleAdicionarGastoFixo}
                onSalvarEdit={handleEditarCategoria}
              />
            </CardHeader>
            <CardContent className="space-y-3">
              {estado.categorias.length === 0 ? (
                <div className="text-base text-neutral-500">Nenhum gasto fixo adicionado.</div>
              ) : (
                estado.categorias.map((c) => (
                  <CategoriaFixa
                    key={c.id}
                    categoria={c}
                    estado={estado}
                    atualizarEstado={atualizarMes}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Aleatorio
          meta={aleatorioMeta}
          semanas={estado.aleatorioSemanas}
          fechadas={estado.aleatorioFechadas}
          fixas={estado.aleatorioQuotaFixas}
          onAddGasto={(semanaIndex, item) => {
            const novo = estado.aleatorioSemanas.map((arr, i) =>
              i === semanaIndex ? [...arr, item] : arr
            ) as EstadoMes["aleatorioSemanas"];
            atualizarMes({ aleatorioSemanas: novo });
          }}
          onRemoveGasto={(semanaIndex, itemId) => {
            const novo = estado.aleatorioSemanas.map((arr, i) =>
              i === semanaIndex ? arr.filter((g) => g.id !== itemId) : arr
            ) as EstadoMes["aleatorioSemanas"];
            atualizarMes({ aleatorioSemanas: novo });
          }}
          onToggleFechar={(semanaIndex, fixedQuota) => {
            const novasFechadas = [...estado.aleatorioFechadas];
            const novasFixas = [...estado.aleatorioQuotaFixas];

            if (estado.aleatorioFechadas[semanaIndex]) {
              novasFechadas[semanaIndex] = false;
              novasFixas[semanaIndex] = null;
            } else {
              novasFechadas[semanaIndex] = true;
              novasFixas[semanaIndex] = fixedQuota ?? null;
            }

            atualizarMes({
              aleatorioFechadas: novasFechadas as [boolean, boolean, boolean, boolean],
              aleatorioQuotaFixas: novasFixas as [number | null, number | null, number | null, number | null],
            });
          }}
        />

        <footer className="text-center text-sm text-neutral-500 py-8">
          Feito com ❤️ para uso no celular — totalmente offline (localStorage).
        </footer>
      </div>
    </main>
  );
}
