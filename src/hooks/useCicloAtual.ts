import useSWR, { KeyedMutator } from "swr";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";

export type CicloResponse = {
  ciclo: CicloAtualDTO | null;
  dataInicio: string;
  dataFim: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCicloAtual(userId: string) {
  const { data, error, isLoading, mutate } = useSWR<CicloResponse>(
    userId ? `/api/ciclos/atual?userId=${userId}` : null,
    fetcher,
    { keepPreviousData: true }
  );

  return {
    cicloAtual: data?.ciclo ?? null,
    // dataInicio: data ? new Date(data.dataInicio) : null,
    // dataFim: data ? new Date(data.dataFim) : null,
    dataInicio: data?.dataInicio,
    dataFim: data?.dataFim,
    isLoading,
    isError: error,
    mutateCiclo: mutate as KeyedMutator<CicloResponse>,
  };
}
