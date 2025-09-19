import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InputCurrency } from "../../InputCurrency"

type DialogCreateEditEconomiaProps = {
    showModal: boolean
    setShowModal: (show: boolean) => void
}

export function DialogCreateEditEconomia ({showModal, setShowModal}: DialogCreateEditEconomiaProps) {
    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="w-100">
            <DialogHeader>
                <DialogTitle className="text-left mb-2">Nova Economia</DialogTitle>
            </DialogHeader>

            <input
                type="text"
                placeholder="Qual sua economia?"
                className="w-full px-3 py-2 border rounded-xl focus:outline-blue-500"
            />

            <InputCurrency placeholder="Valor a guardar (R$)"/>

            <DialogFooter className="flex flex-row justify-end">
                <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                Cancelar
                </button>
                <button className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600">
                Salvar
                </button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}