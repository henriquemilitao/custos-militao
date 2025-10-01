import useSWR, { KeyedMutator } from "swr";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";

export type CicloComMes = {
  ciclo: CicloAtualDTO | null;
  mesReferencia: string; // sempre vem do backend
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCicloAtual(userId: string) {
  const { data, error, isLoading, mutate } = useSWR<CicloComMes>(
    userId ? `/api/ciclos/atual?userId=${userId}` : null,
    fetcher,
    { keepPreviousData: true }
  );

  return {
    cicloAtual: data?.ciclo ?? null,
    mesReferencia: data?.mesReferencia
      ? new Date(data.mesReferencia)
      : new Date(), // fallback
    isLoading,
    isError: error,
    mutateCiclo: mutate as KeyedMutator<CicloComMes>,
  };
}
