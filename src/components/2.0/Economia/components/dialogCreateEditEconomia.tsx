import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InputCurrency } from "../../InputCurrency"
import { CicloAtualDTO } from "@/dtos/ciclo.dto"
import { toast } from "sonner"

type DialogCreateEditEconomiaProps = {
  showModal: boolean
  setShowModal: (show: boolean) => void
  cicloAtual: CicloAtualDTO | null
  mutateCiclo: () => void // <- novo
}

export function DialogCreateEditEconomia({ showModal, setShowModal, cicloAtual, mutateCiclo }: DialogCreateEditEconomiaProps) {
  const [nome, setNome] = useState("")
  const [valor, setValor] = useState<number | null>(null)
  const [confirmZero, setConfirmZero] = useState(false)

  async function handleSalvar() {
    if (!cicloAtual?.id) {
      toast.error("Nenhum ciclo ativo selecionado.")
      return
    }

    if ((valor === null || valor === 0) && !confirmZero) {
      setConfirmZero(true)
      return
    }

    const body = { nome: nome.trim(), valor, cicloId: cicloAtual.id }

    const res = await fetch("/api/economias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    if (!res.ok) {
      toast.error(data?.error || "Erro desconhecido")
      return
    }

    toast.success("Economia salva com sucesso!")

    // 🔑 força atualização do ciclo
    mutateCiclo()

    setShowModal(false)
    setNome("")
    setValor(null)
    setConfirmZero(false)
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="w-100">
        <DialogHeader>
          <DialogTitle className="text-left mb-2">Nova Economia</DialogTitle>
        </DialogHeader>

        <input
          type="text"
          placeholder="Qual sua economia?"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full px-3 py-2 border rounded-xl focus:outline-blue-500"
        />

        <InputCurrency
          placeholder="Valor a guardar (R$)"
          value={valor}
          onValueChange={(val) => setValor(val)}
        />

        {confirmZero && (
          <p className="text-sm text-yellow-600 mt-2">
            ⚠️ Você tem certeza que deseja salvar uma economia sem valor/meta?
          </p>
        )}

        <DialogFooter className="flex flex-row justify-end">
          <button
            onClick={() => {
              setShowModal(false)
              setConfirmZero(false)
            }}
            className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600"
          >
            {confirmZero ? "Confirmar" : "Salvar"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
