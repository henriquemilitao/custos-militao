"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  LogOut,
  CalendarIcon,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { KeyedMutator } from "swr";
import { CicloResponse } from "@/hooks/useCicloAtual";

type ResumoMesCardProps = {
  mutateCiclo: KeyedMutator<CicloResponse>; // ✅ agora bate com o hook
  cicloAtual: CicloAtualDTO | null;
  dataInicio: string | undefined;
  dataFim: string | undefined;
  userId: string
  setDatas: (datas: {inicio: string; fim: string}) => void

};

export default function HeaderSistema({
  mutateCiclo,
  cicloAtual,
  dataInicio,
  dataFim,
  userId,
  setDatas
}: ResumoMesCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date());

  // pega session atual
  const { data: session } = authClient.useSession();
  const router = useRouter();

  async function handleProximoCiclo() {
    try {
      const inicio = cicloAtual
        ? cicloAtual?.dataInicio instanceof Date
          ? cicloAtual.dataInicio.toISOString()
          : cicloAtual?.dataInicio
        : dataInicio


      const fim = cicloAtual 
        ? cicloAtual.dataFim instanceof Date
          ? cicloAtual.dataFim.toISOString()
          : cicloAtual?.dataFim
        : dataFim

      if (!inicio || !fim) throw new Error("Datas inválidas");
      
      console.log({dataInicio, dataFim})
      const params = new URLSearchParams({
        inicio: inicio,
        fim: fim,
        // inicio: inicio ?? '',
        // fim: fim ?? '',
      });

      const res = await fetch(`/api/ciclos/proximo?${params}`, {
        method: "GET",
      });

      if (!res.ok) throw new Error("Erro ao buscar próximo ciclo");

      const data = await res.json();
      console.log({inicio: data.dataInicio, fim: data.dataFim})
      // atualiza SWR com o novo ciclo
      // atualiza o estado com as novas datas
      setDatas({ inicio: data.dataInicio, fim: data.dataFim });

      // if (res.status === 404) {
      //   // Nenhum ciclo → avança só o mês e limpa cicloAtual
      //   setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() + 1)));
      //   mutateCiclo(null); 
      //   return;
      // }

      // if (!res.ok) throw new Error("Erro ao buscar próximo ciclo");

      // const data = await res.json();
      // console.log("Próximo ciclo:", data);

      // mutateCiclo(data);
      // Atualiza o mesAtual baseado no ciclo retornado
      // setMesAtual(new Date(data.dataInicio));
    } catch (error) {
      console.error("Erro ao buscar próximo ciclo:", error);
    }
  }


  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm rounded-2xl mb-4">
      {/* Navegação de mês */}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="font-medium text-gray-700">
              {format(mesAtual, "MMMM/yyyy", { locale: ptBR })}
            </Button>
          </PopoverTrigger>
        </Popover>

        {/* Botão próximo ciclo */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleProximoCiclo}
          className="rounded-lg"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Avatar dinâmico */}
      {session?.user && (
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          onClick={() => setSheetOpen(true)}
        >
          <Avatar>
            <AvatarImage src={session.user.image as string | undefined} />
            <AvatarFallback>
              {session.user.name?.split(" ")?.[0]?.[0]}
              {session.user.name?.split(" ")?.[1]?.[0]}
            </AvatarFallback>
          </Avatar>
        </Button>
      )}

      {/* Sheet lateral */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-72">
          <SheetHeader>
            <SheetTitle>Minha conta</SheetTitle>
          </SheetHeader>

          {session?.user ? (
            <div className="flex flex-col items-center gap-2 mt-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={session.user.image as string | undefined} />
                <AvatarFallback>
                  {session.user.name?.split(" ")?.[0]?.[0]}
                  {session.user.name?.split(" ")?.[1]?.[0]}
                </AvatarFallback>
              </Avatar>
              <p className="font-medium">{session.user.name}</p>
              <p className="text-sm text-gray-500">{session.user.email}</p>
            </div>
          ) : (
            <p className="text-center mt-6 text-gray-500">
              Nenhum usuário logado
            </p>
          )}

          {session?.user && (
            <div className="mt-6 space-y-2 px-5">
              <Button
                variant="destructive"
                className="w-full flex items-center gap-2 rounded-xl"
                onClick={async () => {
                  await authClient.signOut();
                  router.push("/authentication");
                }}
              >
                <LogOut className="h-4 w-4" /> Sair
              </Button>
            </div>
          )}

          <SheetFooter />
        </SheetContent>
      </Sheet>
    </div>
  );
}
