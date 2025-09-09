// src/types/budget.ts
export type CategoriaFixaType = {
  id: string;
  nome: string;
  meta: number;
  pago: boolean;
};

export type GastoGasolina = {
  id: string;
  data: string; // ISO
  valor: number;
};

export type GastoItem = {
  id: string;
  descricao: string;
  valor: number;
  dataPtBr: string;
};

export type Economia = {
  id: string;
  titulo: string;
  meta: number;
  economizado: boolean;
};

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

export type MapMeses = Record<string, EstadoMes>;
