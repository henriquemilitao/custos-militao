import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InputCurrency } from "../../InputCurrency"

type DialogCreateEditEconomiaProps = {
  showModal: boolean
  setShowModal: (show: boolean) => void
}

export function DialogCreateEditEconomia({ showModal, setShowModal }: DialogCreateEditEconomiaProps) {
  const [nome, setNome] = useState("")
  const [valor, setValor] = useState<number | null>(null)

  async function handleSalvar() {
    try {
      const res = await fetch("/api/economias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, valor }),
      })

      if (!res.ok) {
        throw new Error("Erro ao salvar economia")
      }

      // sucesso!
      setShowModal(false)
      setNome("")
      setValor(0)
      // aqui você pode recarregar a lista (props ou mutate do SWR/react-query)
    } catch (error) {
      console.error(error)
    }
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

        <DialogFooter className="flex flex-row justify-end">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600"
          >
            Salvar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
