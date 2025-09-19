// hooks/useCicloAtual.ts
import useSWR from "swr"
import { CicloAtualDTO } from "@/dtos/ciclo.dto"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useCicloAtual(userId: string) {
  const { data, error, isLoading, mutate } = useSWR<CicloAtualDTO>(
    userId ? `/api/ciclos/atual?userId=${userId}` : null,
    fetcher
  )

  return {
    cicloAtual: data ?? null,
    isLoading,
    isError: error,
    mutateCiclo: mutate, // <- importante pra forçar revalidação
  }
}
