import useSWR, { KeyedMutator } from "swr";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";

export type CicloResponse = {
  ciclo: CicloAtualDTO | null;
  dataInicio: string;
  dataFim: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCicloAtual(
  userId: string,
  dataInicio?: string,
  dataFim?: string
) {
  const shouldFetch = Boolean(userId);

  const { data, error, isLoading, mutate } = useSWR<CicloResponse>(
    shouldFetch
      ? `/api/ciclos/atual?userId=${userId}${
          dataInicio && dataFim ? `&dataInicio=${dataInicio}&dataFim=${dataFim}` : ""
        }`
      : null,
    fetcher,
    { keepPreviousData: true }
  );

  return {
    cicloAtual: data?.ciclo ?? null,
    dataInicio: data?.dataInicio,
    dataFim: data?.dataFim,
    isLoading,
    isError: error,
    mutateCiclo: mutate as KeyedMutator<CicloResponse>,
  };
}