import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Economia } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";

export enum TipoItemDelete {
  ECONOMIAS = 'economias'
}

type DialogConfirmDeleteProps = {
  showModal: boolean
  setShowModal: (show: boolean) => void
  mutateCiclo: () => void
  item: Economia | null
  tipoItem: TipoItemDelete
}

export function DialogConfirmDelete({ showModal, setShowModal, mutateCiclo, item, tipoItem }: DialogConfirmDeleteProps) {
  const [loading, setLoading] = useState(false);


  const handleDelete = async () => {
    try {
        setLoading(true);
        const res = await fetch(`/api/${tipoItem}/${item?.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Erro ao deletar seu item");
        setLoading(false);
        return;
      }

      toast.success("Item deletado com sucesso!", {
        style: {
          background: "#dcfce7",
          color: "#166534",
        },
      });

      mutateCiclo();
      setShowModal(false); // fecha após deletar
    } catch {
      toast.error("Não foi possível deletar seu item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="w-100">
        <DialogHeader>
          <DialogTitle className="text-left mb-2">Confirmação</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-yellow-600 mb-2">
          ⚠️ Você tem certeza que deseja deletar{" "}
          <span className="text-base font-semibold">
            {item?.nome ?? "este item"}
          </span>
          ?
        </p>

        <DialogFooter className="flex flex-row justify-end">
           <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? "Deletando..." : "Deletar"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
