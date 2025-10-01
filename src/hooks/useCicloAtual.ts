import useSWR, { KeyedMutator } from "swr";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCicloAtual(userId: string) {
  const { data, error, isLoading, mutate } = useSWR<CicloAtualDTO>(
    userId ? `/api/ciclos/atual?userId=${userId}` : null,
    fetcher,
    { keepPreviousData: true }
  );

  return {
    cicloAtual: data ?? null,
    isLoading,
    isError: error,
    mutateCiclo: mutate as KeyedMutator<CicloAtualDTO>, // 👈 garante que seja o mutate certo
  };
}
