import useSWR from "swr";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCicloAtual(userId: string) {
  const { data, error, isLoading, mutate } = useSWR<CicloAtualDTO>(
    userId ? `/api/ciclos/atual?userId=${userId}` : null,
    fetcher
  );

  async function irParaAnterior(dataInicio: string) {
    const resp = await fetch(
      `/api/ciclos/anterior?userId=${userId}&data=${dataInicio}`
    );
    const novo = await resp.json();
    mutate(novo, false);
  }

  async function irParaProximo(dataFim: string) {
    const resp = await fetch(
      `/api/ciclos/proximo?userId=${userId}&data=${dataFim}`
    );
    const novo = await resp.json();
    mutate(novo, false);
  }

  return {
    cicloAtual: data ?? null,
    isLoading,
    isError: error,
    mutateCiclo: mutate,
    irParaAnterior,
    irParaProximo,
  };
}
