// page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import ConfigMes from "@/components/ConfigMes";
import ConfigEconomia, { Economia as EconomiaType } from "@/components/ConfigEconomia";
import EconomiaItem from "@/components/EconomiaItem";
import CategoriaFixa from "@/components/CategoriaFixa";
import Aleatorio from "@/components/Aleatorio";
import ResumoMes from "@/components/ResumoMes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---- Tipos ----
export type CategoriaFixaType = {
  id: string;
  nome: string;
  meta: number; // valor planejado da categoria no mês
  pago: boolean; // se foi pago (incrementa gasto igual à meta)
};

export type GastoItem = {
  id: string;
  descricao: string;
  valor: number;
  dataPtBr: string; // capturada em America/Campo_Grande
};

export type EstadoMes = {
  mesId: string; // YYYY-MM
  saldoInicial: number; // quanto tenho disponível no mês
  categorias: CategoriaFixaType[]; // exceto Aleatório
  aleatorioMeta: number; // meta do "Aleatório" para o mês
  // gastos aleatórios por semana (índices 0..3)
  aleatorioSemanas: [GastoItem[], GastoItem[], GastoItem[], GastoItem[]];
  // permite “fechar” / marcar uma semana (botão Finalizar)
  aleatorioFechadas: [boolean, boolean, boolean, boolean];
  // NOVO: quotas travadas quando o usuário clica Finalizar (ou null se não travada)
  aleatorioQuotaFixas: [number | null, number | null, number | null, number | null];
};

type MapMeses = Record<string, EstadoMes>;

const LS_KEY = "budget-planner-v2";

function yyyymm(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// function moeda(n: number) {
//   return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
//     isFinite(n) ? n : 0
//   );
// }

function load(): MapMeses {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Partial<EstadoMes>>;

    const migrated: MapMeses = {};
    for (const k of Object.keys(parsed)) {
      const v = parsed[k] as Partial<EstadoMes>;
      migrated[k] = {
        mesId: (v?.mesId as string) ?? k,
        saldoInicial: Number(v?.saldoInicial ?? 1200),
        categorias: (v?.categorias as CategoriaFixaType[]) ?? [],
        aleatorioMeta: Number(v?.aleatorioMeta ?? 400),
        aleatorioSemanas: (v?.aleatorioSemanas as EstadoMes["aleatorioSemanas"]) ?? [[], [], [], []],
        aleatorioFechadas: (v?.aleatorioFechadas as EstadoMes["aleatorioFechadas"]) ?? [false, false, false, false],
        aleatorioQuotaFixas:
          (v?.aleatorioQuotaFixas as EstadoMes["aleatorioQuotaFixas"]) ?? [null, null, null, null],
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
  // estado local de economias (pode persistir mais tarde se quiser)
  const [economias, setEconomias] = useState<EconomiaType[]>([]);

  
// chamada para adicionar vindo do ConfigEconomia (salva meta e titulo)
function handleAdicionarEconomia(nova: Omit<EconomiaType, "id" | "guardado">) {
  const e: EconomiaType = {
    id: crypto.randomUUID(),
    titulo: nova.titulo,
    meta: nova.meta,
    guardado: 0,
  };
  setEconomias((prev) => [e, ...prev]);
}

  function handleRemoverEconomia(id: string) {
    setEconomias((prev) => prev.filter((e) => e.id !== id));
  }


  // bootstrap localStorage
  useEffect(() => {
    const m: MapMeses = load();

    // cria estado inicial do mês, se não existir
    if (!m[mesHoje]) {
      m[mesHoje] = {
        mesId: mesHoje,
        saldoInicial: 1200,
        categorias: [
          { id: crypto.randomUUID(), nome: "Cabeleireiro", meta: 120, pago: false },
          { id: crypto.randomUUID(), nome: "Comida", meta: 600, pago: false },
          { id: crypto.randomUUID(), nome: "Água", meta: 80, pago: false },
        ],
        aleatorioMeta: 400,
        aleatorioSemanas: [[], [], [], []],
        aleatorioFechadas: [false, false, false, false],
        aleatorioQuotaFixas: [null, null, null, null],
      };
    } else {
      // defensive: garantir estrutura consistente
      const v = m[mesHoje]!;
      if (!Array.isArray(v.aleatorioFechadas) || v.aleatorioFechadas.length !== 4) {
        v.aleatorioFechadas = [false, false, false, false];
      }
      if (
        !Array.isArray(v.aleatorioSemanas) ||
        v.aleatorioSemanas.length !== 4 ||
        !v.aleatorioSemanas.every((a) => Array.isArray(a))
      ) {
        v.aleatorioSemanas = [[], [], [], []];
      }
      if (!Array.isArray(v.aleatorioQuotaFixas) || v.aleatorioQuotaFixas.length !== 4) {
        v.aleatorioQuotaFixas = [null, null, null, null];
      }
    }

    setMap(m);
  }, [mesHoje]);

  // persistir
  useEffect(() => {
    if (Object.keys(map).length) save(map);
  }, [map]);

  // pega estado do mês atual
  const estado = map[mes] as EstadoMes | undefined;

  function atualizarMes(patch: Partial<EstadoMes>) {
    setMap((old) => ({
      ...old,
      [mes]: {
        ...(old[mes] ?? {
          mesId: mes,
          saldoInicial: 0,
          categorias: [],
          aleatorioMeta: 0,
          aleatorioSemanas: [[], [], [], []],
          aleatorioFechadas: [false, false, false, false],
          aleatorioQuotaFixas: [null, null, null, null],
        }),
        ...patch,
      },
    }));
  }

  if (!estado) {
    return (
      <main className="p-6">
        <p>Carregando…</p>
      </main>
    );
  }

  // ----- Cálculos Resumo -----
  const totalPlanejadoFixas = estado.categorias.reduce((s, c) => s + c.meta, 0);
  const totalPlanejado = totalPlanejadoFixas + estado.aleatorioMeta;

  const gastoFixas = estado.categorias.reduce((s, c) => s + (c.pago ? c.meta : 0), 0);
  const gastoAleatorio = estado.aleatorioSemanas.flat().reduce((s, it) => s + it.valor, 0);
  const totalGasto = gastoFixas + gastoAleatorio;

  const saldoDisponivel = estado.saldoInicial - totalGasto;
  const diferençaPlanejadoSaldo = estado.saldoInicial - totalPlanejado;

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Header simples */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <h1 className="text-lg font-semibold">Planejador Semanal de Gastos</h1>
          <div className="ml-auto flex items-center gap-2">
            <input
              className="border rounded-xl px-3 py-1.5 w-[120px]"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              placeholder="YYYY-MM"
            />
          </div>
        </div>
      </header>


      {/* Economias */}
      <Card className="rounded-2xl shadow-sm m-4">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Economias</CardTitle>

          {/* botão que abre o modal para criar economia */}
          <ConfigEconomia
            onAdicionar={(nova) => handleAdicionarEconomia(nova)}
          />
        </CardHeader>

        <CardContent className="space-y-3">
          {economias.length === 0 && (
            <div className="text-sm text-neutral-500">Nenhuma economia adicionada.</div>
          )}

          {economias.map((eco) => (
            <EconomiaItem
              key={eco.id}
              economia={eco}
              onGuardar={() =>
                // aqui eu escolho guardar tudo de uma vez (guardado = meta)
                setEconomias((prev) => prev.map((e) => (e.id === eco.id ? { ...e, guardado: e.meta } : e)))
              }
              onRemove={() => handleRemoverEconomia(eco.id)}
            />
          ))}
        </CardContent>
      </Card>


      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Configurações do mês */}
        <ConfigMes mes={mes} estado={estado} onUpdate={atualizarMes} />

        {/* Grid principal responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Categorias Fixas */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Categorias Fixas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {estado.categorias.length === 0 && (
                <div className="text-sm text-neutral-500">Nenhuma categoria adicionada.</div>
              )}
              {estado.categorias.map((c) => (
                <CategoriaFixa
                  key={c.id}
                  categoria={c}
                  onToggle={() => {
                    atualizarMes({
                      categorias: estado.categorias.map((x) =>
                        x.id === c.id ? { ...x, pago: !x.pago } : x
                      ),
                    });
                  }}
                  onRemove={() => {
                    atualizarMes({
                      categorias: estado.categorias.filter((x) => x.id !== c.id),
                    });
                  }}
                />
              ))}
            </CardContent>
          </Card>

          {/* Aleatório */}
          <Aleatorio
            meta={estado.aleatorioMeta}
            semanas={estado.aleatorioSemanas}
            fechadas={estado.aleatorioFechadas}
            fixas={estado.aleatorioQuotaFixas}
            onChangeMeta={(v) => atualizarMes({ aleatorioMeta: v })}
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
              // fixedQuota === number when we are closing and want to fix the current quota
              // fixedQuota === null/undefined when reopening
              const novo = estado.aleatorioFechadas.map((f, i) => (i === semanaIndex ? !f : f)) as EstadoMes["aleatorioFechadas"];
              const novoFixas = estado.aleatorioQuotaFixas.map((q, i) =>
                i === semanaIndex ? (fixedQuota ?? null) : q
              ) as EstadoMes["aleatorioQuotaFixas"];
              atualizarMes({ aleatorioFechadas: novo, aleatorioQuotaFixas: novoFixas });
            }}
          />
        </div>

        {/* Resumo */}
        <ResumoMes
          saldoInicial={estado.saldoInicial}
          economias={economias}
          gastoFixas={gastoFixas}
          gastoAleatorio={gastoAleatorio}
          totalPlanejadoFixas={totalPlanejadoFixas}
          aleatorioMeta={estado.aleatorioMeta}
        />

        <footer className="text-center text-xs text-neutral-500 py-8">
          Feito com ❤️ para uso no celular — totalmente offline (localStorage).
        </footer>
      </div>
    </main>
  );
}
