"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CategoriaFixaType } from "@/app/page";

export default function CategoriaFixa({
  categoria,
  onToggle,
  onRemove,
}: {
  categoria: CategoriaFixaType;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <Card className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm transition-opacity duration-200 ${categoria.pago ? 'opacity-60' : 'opacity-100'}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${categoria.pago ? 'bg-green-100' : 'bg-neutral-100'}`}>
          {categoria.pago ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </div>

        <div className="min-w-0">
          <p className="font-medium truncate">{categoria.nome}</p>
          <p className="text-xs text-neutral-500">Meta: R$ {categoria.meta.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant={categoria.pago ? "secondary" : "default"} onClick={onToggle} className="px-3 py-1">
          {categoria.pago ? "Desfazer" : "Pagar"}
        </Button>
        <Button variant="destructive" onClick={onRemove} className="px-3 py-1">
          Remover
        </Button>
      </div>
    </Card>
  );
}