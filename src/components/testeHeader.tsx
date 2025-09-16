"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Settings, LogOut, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HeaderSistema() {
  const [configOpen, setConfigOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaInicio, setDiaInicio] = useState<number>(1);

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

  const handleSelectMesAno = (mes: number, ano: number) => {
    const novo = new Date(mesAtual);
    novo.setMonth(mes);
    novo.setFullYear(ano);
    setMesAtual(novo);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm rounded-2xl mb-4">
      {/* Navegação de mês */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleMesAnterior} className="rounded-lg">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Popover para selecionar mês/ano */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="font-medium text-gray-700">
              {format(mesAtual, "MMMM/yyyy", { locale: ptBR })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <div className="flex gap-2">
              {/* Select de mês */}
              <Select
                onValueChange={(mes) => handleSelectMesAno(Number(mes), mesAtual.getFullYear())}
                defaultValue={String(mesAtual.getMonth())}
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

              {/* Select de ano */}
              <Select
                onValueChange={(ano) => handleSelectMesAno(mesAtual.getMonth(), Number(ano))}
                defaultValue={String(mesAtual.getFullYear())}
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
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="sm" onClick={handleMesProximo} className="rounded-lg">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Avatar do usuário (abre sheet) */}
      <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setSheetOpen(true)}>
        <img
          src="https://ui-avatars.com/api/?name=Lucy+Vizotto"
          alt="user"
          className="h-8 w-8 rounded-full"
        />
      </Button>

      {/* Sheet do usuário */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-72">
          <SheetHeader>
            <SheetTitle>Minha conta</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col items-center gap-2 mt-4">
            <img
              src="https://ui-avatars.com/api/?name=Lucy+Vizotto"
              alt="user"
              className="h-16 w-16 rounded-full"
            />
            <p className="font-medium">Lucy Vizotto</p>
            <p className="text-sm text-gray-500">lucy@email.com</p>
          </div>

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
              onClick={() => alert("Logout")}
            >
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>

          <SheetFooter />
        </SheetContent>
      </Sheet>

      {/* Modal de configuração */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar mês</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Escolha o dia que representa o <b>início do mês</b>. 
              O fim será o dia anterior do mês seguinte.
            </p>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Dia de início</label>
              <select
                value={diaInicio}
                onChange={(e) => setDiaInicio(Number(e.target.value))}
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((dia) => (
                  <option key={dia} value={dia}>
                    Dia {dia}
                  </option>
                ))}
              </select>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
              Exemplo: início em <b>dia {diaInicio}</b> → fim em{" "}
              <b>
                {diaInicio - 1 <= 0 ? "último dia do mês" : `dia ${diaInicio - 1}`}
              </b>{" "}
              do próximo mês
            </div>
          </div>
          <DialogFooter>
            <Button
                variant="outline"
                className="w-full px-4 py-2 rounded-xl border text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setConfigOpen(false)}
                >
                Cancelar
            </Button>
            <Button 
                onClick={() => setConfigOpen(false)}
                className="w-full px-4 py-2 rounded-xl bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition">
                Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
