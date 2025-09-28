"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR, ro, se } from "date-fns/locale";
import { Calendar } from "../ui/calendar";

// 🟢 importei o cliente de auth
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export default function HeaderSistema() {
  const [configOpen, setConfigOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [tipoCiclo, setTipoCiclo] = useState<"mensal" | "personalizado">(
    "mensal"
  );
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined);
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined);

  // 🟢 pega session atual
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const handleMesAnterior = () => {
    const novo = new Date(mesAtual);
    novo.setMonth(mesAtual.getMonth() - 1);
    setMesAtual(novo);
  };

  const handleMesProximo = () => {
    const novo = new Date(mesAtual);
    novo.setMonth(mesAtual.getMonth() + 1);
    setMesAtual(novo);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm rounded-2xl mb-4">
      {/* Navegação de mês */}
      <div className="flex items-center gap-2">
        {/* <Button
          variant="outline"
          size="sm"
          onClick={handleMesAnterior}
          className="rounded-lg"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button> */}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="font-medium text-gray-700">
              {format(mesAtual, "MMMM/yyyy", { locale: ptBR })}
            </Button>
          </PopoverTrigger>
          {/* <PopoverContent className="w-60">
            <div className="flex gap-2">
              <Select
                defaultValue={String(mesAtual.getMonth())}
                onValueChange={() => {}}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {format(new Date(2025, i, 1), "MMMM", { locale: ptBR })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                defaultValue={String(mesAtual.getFullYear())}
                onValueChange={() => {}}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const ano = new Date().getFullYear() - 5 + i;
                    return (
                      <SelectItem key={ano} value={String(ano)}>
                        {ano}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </PopoverContent> */}
        </Popover>

        {/* <Button
          variant="outline"
          size="sm"
          onClick={handleMesProximo}
          className="rounded-lg"
        >
          <ChevronRight className="h-4 w-4" />
        </Button> */}
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
                variant="outline"
                className="w-full flex items-center gap-2 rounded-xl"
                onClick={() => setConfigOpen(true)}
              >
                <Settings className="h-4 w-4" /> Configurações
              </Button>
              <Button
                variant="destructive"
                className="w-full flex items-center gap-2 rounded-xl"
                onClick={async () => {
                  await authClient.signOut();
                  router.push('/authentication');
                }}
              >
                <LogOut className="h-4 w-4" /> Sair
              </Button>
            </div>
          )}

          <SheetFooter />
        </SheetContent>
      </Sheet>

      {/* Modal Configuração */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="w-[92%] max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>Configurar ciclo financeiro</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Escolha se deseja usar ciclo mensal padrão ou definir suas próprias
              datas.
            </p>

            {/* Tipo de ciclo */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tipoCiclo"
                  value="mensal"
                  checked={tipoCiclo === "mensal"}
                  onChange={() => setTipoCiclo("mensal")}
                />
                <span className="text-sm text-neutral-700">
                  Mensal (1º até fim do mês)
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tipoCiclo"
                  value="personalizado"
                  checked={tipoCiclo === "personalizado"}
                  onChange={() => setTipoCiclo("personalizado")}
                />
                <span className="text-sm text-neutral-700">
                  Personalizado (definir datas)
                </span>
              </label>
            </div>

            {/* Datas só aparecem se for personalizado */}
            {tipoCiclo === "personalizado" && (
              <div className="flex gap-3 mt-3 flex-nowrap">
                {/* Início */}
                <div className="flex-1 min-w-0 space-y-1">
                  <label className="text-base text-neutral-700">
                    Início do ciclo
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start rounded-xl"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataInicio ? (
                          format(dataInicio, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Escolha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dataInicio}
                        onSelect={(d) => d && setDataInicio(d)}
                        locale={ptBR}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Fim */}
                <div className="flex-1 min-w-0 space-y-1">
                  <label className="text-base text-neutral-700">
                    Fim do ciclo
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start rounded-xl"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataFim ? (
                          format(dataFim, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Escolha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dataFim}
                        onSelect={(d) => d && setDataFim(d)}
                        locale={ptBR}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 flex flex-col sm:flex-row sm:flex-nowrap sm:justify-end gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto rounded-xl"
              onClick={() => setConfigOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="w-full sm:w-auto rounded-xl bg-blue-500 text-white shadow hover:bg-blue-600"
              onClick={() => setConfigOpen(false)}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
