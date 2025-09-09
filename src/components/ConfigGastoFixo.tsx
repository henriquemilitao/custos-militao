"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Edit3 } from "lucide-react";
import type { CategoriaFixaType } from "@/app/page";
import { on } from "events";

type Props = {
  onAdicionar?: (nova: Omit<CategoriaFixaType, "id" | "pago">) => void;
  onSalvarEdit?: (id: string, dados: { nome: string; meta: number }) => void;
  initial?: { id: string; nome: string; meta: number } | null;
  trigger?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  readOnly?: boolean; // 👈 NOVO
};

export default function ConfigGastoFixo({
  onAdicionar,
  onSalvarEdit,
  initial = null,
  trigger,
  onOpenChange,
  readOnly
}: Props) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState<number | "">("");

  const isEditMode = Boolean(initial && onSalvarEdit);

  function openModal() {
    if (isEditMode && initial) {
      setNome(initial.nome);
      setValor(initial.meta);
    } else {
      setNome("");
      setValor("");
    }
    setOpen(true);
    onOpenChange?.(true);
  }

  function reset() {
    setNome("");
    setValor("");
    setOpen(false);
    onOpenChange?.(false);
  }

  function handleSalvar() {
    const v = typeof valor === "number" ? valor : 0;
    if (!nome.trim() || v <= 0) return;

    if (isEditMode && onSalvarEdit && initial) {
      onSalvarEdit(initial.id, { nome: nome.trim(), meta: v });
    } else if (!isEditMode && onAdicionar) {
      onAdicionar({ nome: nome.trim(), meta: v });
    }
    reset();
  }

  return (
    <>
      {trigger ? (
        <span onClick={openModal}>{trigger}</span>
      ) : (
        <Button
          onClick={openModal}
          className="px-3 py-1 w-10 h-10 rounded-full border border-blue-400 text-blue-500 bg-white shadow-none hover:bg-blue-500 hover:text-white"
          title={isEditMode ? "Editar gasto fixo" : "Novo gasto fixo"}
        >
          {isEditMode ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </Button>
      )}

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          onOpenChange?.(nextOpen); // 🔹 garante que o pai saiba se tá aberto ou não
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">{isEditMode ? "Editar Gasto Fixo" : "Novo Gasto Fixo"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
             <label className="text-base text-neutral-700 block mb-2">
              Nome
              <input
                placeholder="Ex: Internet, Netflix..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={`mt-1 block w-full border rounded-xl px-3 py-2 ${readOnly && 'bg-gray-100 cursor-not-allowed'}`}
                disabled={readOnly}
              />
            </label>
            <label className="text-base text-neutral-700 block mb-4">
              Valor (R$)
              <input
                type="number"
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={valor === "" ? "" : String(valor)}
                onChange={(e) => setValor(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1 block w-full border rounded-xl px-3 py-2"
                />
              </label>
          </div>

          <DialogFooter className="mt-2 flex flex-row justify-end gap-2">
            <Button variant="outline" className="px-3 py-1 rounded-xl border" onClick={() => {
              setOpen(false);
              onOpenChange?.(false);
            }}>Cancelar</Button>
            <Button onClick={handleSalvar}
                // className="w-10 h-10 w-full sm:w-auto rounded-full bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition"
                className="px-4 py-2 rounded-xl bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition">
                    Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
