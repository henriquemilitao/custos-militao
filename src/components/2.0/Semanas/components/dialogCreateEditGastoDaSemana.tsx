"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrencyFromCents } from "@/lib/formatters/formatCurrency";
import { toast } from "sonner";

type Props = {
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  registro: { id: string; nome: string; valor: number } | null;
  mutateCiclo: () => void;
};

export function DialogCreateEditRegistro({ showModal, setShowModal, registro, mutateCiclo }: Props) {
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState(0);

  useEffect(() => {
    if (registro) {
      setNome(registro.nome);
      setValor(registro.valor);
    }
  }, [registro]);

  async function handleSave() {
    if (!registro) return;
    try {
      const res = await fetch(`/api/registros/${registro.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nome, valorCents: valor }),
      });

      if (!res.ok) throw new Error("Erro ao salvar registro");
      toast.success("Registro atualizado!");
      mutateCiclo();
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Registro</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Descrição"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <Input
            type="number"
            placeholder="Valor"
            value={valor}
            onChange={(e) => setValor(Number(e.target.value))}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
