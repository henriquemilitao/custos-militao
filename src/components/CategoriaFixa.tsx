"use client";

import { useState } from "react";
import { Trash2, CheckCircle, RotateCcw, Plus, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CategoriaFixaType, EstadoMes, GastoGasolina } from "@/app/page";
import ConfigGastoFixo from "./ConfigGastoFixo";

type Props = {
  categoria: CategoriaFixaType;
  estado: EstadoMes;
  atualizarEstado: (patch: Partial<EstadoMes>) => void;
};

export default function CategoriaFixa({ categoria, estado, atualizarEstado }: Props) {
  const isGasolina = categoria.nome.toLowerCase() === "gasolina";
  const [novoValor, setNovoValor] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // total já gasto em gasolina
  const totalGasto = (estado.gasolinaGastos ?? []).reduce((sum, g) => sum + g.valor, 0);
  const restante = categoria.meta - totalGasto;
  const percentualUso = (totalGasto / Math.max(1, categoria.meta)) * 100;

  const adicionarGasolina = () => {
    const valor = parseFloat(novoValor);
    if (!valor || valor <= 0) return;
    const novoGasto: GastoGasolina = {
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
      valor,
    };
    atualizarEstado({ gasolinaGastos: [...(estado.gasolinaGastos ?? []), novoGasto] });
    setNovoValor("");
  };

  const removerGasolina = (id: string) => {
    atualizarEstado({
      gasolinaGastos: (estado.gasolinaGastos ?? []).filter((g) => g.id !== id),
    });
  };

  const togglePago = () => {
    atualizarEstado({
      categorias: estado.categorias.map((c) =>
        c.id === categoria.id ? { ...c, pago: !c.pago } : c
      ),
    });
  };

  const removerCategoria = () => {
    atualizarEstado({
      categorias: estado.categorias.filter((c) => c.id !== categoria.id),
    });
  };

  const handleSalvarEdit = (id: string, dados: { nome: string; meta: number }) => {
    atualizarEstado({
      categorias: estado.categorias.map((c) =>
        c.id === id ? { ...c, nome: dados.nome, meta: dados.meta } : c
      ),
    });
  };

  const paidClasses = categoria.pago
    ? "opacity-0 bg-green-50 border-green-200"
    : "opacity-100 bg-white";

  // 🔹 Categoria especial: Gasolina
  if (isGasolina) {
    return (
      <div className={`p-4 border rounded-2xl shadow ${paidClasses}`}>
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{categoria.nome}</h3>
          <ConfigGastoFixo
            initial={{ id: categoria.id, nome: categoria.nome, meta: categoria.meta }}
            onSalvarEdit={handleSalvarEdit}
            onOpenChange={setIsEditing} // 🔹 controla se o modal tá aberto
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="text-neutral-600 hover:text-neutral-800"
                title="Editar"
              >
                <Edit3 className="w-5 h-5" />
              </Button>
            }
          />
        </div>

        {/* Valor estipulado */}
        <div className="mt-2 text-base text-neutral-600">
          Meta:{" "}
          <span className="font-medium">R$ {categoria.meta.toFixed(2)}</span>
        </div>

        {/* Gastos e Disponível */}
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-neutral-500">Já gastei</div>
            <div className="font-medium text-base">R$ {totalGasto.toFixed(2)}</div>
          </div>
          <div>
            {restante < 0 ? (
              <div className="text-neutral-500">
                <div>Ultrapassou</div>
                <div className="text-red-600 font-medium text-base">
                  {Math.abs(restante).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </div>
            ) : (
              <div className="text-neutral-500">
                <div>Disponível</div>
                <div className="text-green-600 font-medium text-base">
                  {restante.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Barrinha de progresso */}
        <div className="mt-3">
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              style={{ width: `${Math.min(percentualUso, 100)}%` }}
              className={`h-2 ${
                percentualUso > 100
                  ? "bg-red-600"
                  : percentualUso > 90
                  ? "bg-red-500"
                  : percentualUso > 85
                  ? "bg-orange-500"
                  : percentualUso > 80
                  ? "bg-yellow-500"
                  : percentualUso > 70
                  ? "bg-yellow-400"
                  : percentualUso > 60
                  ? "bg-yellow-300"
                  : "bg-green-500"
              } transition-all`}
            />
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Gastei {percentualUso.toFixed(0)}%
          </div>
        </div>

        {/* Input + botão */}
        <div className="mt-4 flex items-center gap-2">
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="Valor abastecido"
            value={novoValor}
            onChange={(e) => setNovoValor(e.target.value)}
            className="w-40"
          />
          <Button
            onClick={adicionarGasolina}
            size="icon"
            className="w-10 h-10 rounded-full border border-blue-400 text-blue-500 bg-white shadow-none hover:bg-blue-500 hover:text-white"
            title="Adicionar gasto"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Lista de gastos */}
        <ul className="space-y-2 mt-4">
          {(estado.gasolinaGastos ?? []).length === 0 ? (
            <li className="text-sm text-neutral-500">Nenhum gasto registrado.</li>
          ) : (
            estado.gasolinaGastos!.map((gasto) => (
              <li
                key={gasto.id}
                className="flex justify-between items-center p-2 border rounded bg-gray-50"
              >
                <div className="text-sm">
                  <div className="text-neutral-500 text-xs">
                    {new Date(gasto.data).toLocaleDateString("pt-BR")}
                  </div>
                  <div className="font-medium">R$ {gasto.valor.toFixed(2)}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => removerGasolina(gasto.id)}
                  title="Remover gasto"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))
          )}
        </ul>
      </div>
    );
  }

  // 🔹 Categoria comum
  return (
    <div
      className={`p-4 border rounded-2xl shadow flex items-center justify-between transition duration-200 ${
        categoria.pago && !isEditing
          ? "opacity-60 bg-green-50 border-green-300"
          : "opacity-100 bg-white"
      }`}
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 break-all whitespace-normal max-w-[200px]">
          {categoria.nome}
          {categoria.pago && <CheckCircle className="w-5 h-5 text-green-600" />}
        </h3>
        <p className="text-base text-gray-600">
          Valor: R$ {categoria.meta.toFixed(2)}
        </p>
      </div>

      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePago}
          className={categoria.pago ? "text-blue-500" : "text-green-600"}
          title={categoria.pago ? "Desmarcar como pago" : "Marcar como pago"}
        >
          {categoria.pago ? (
            <RotateCcw className="w-5 h-5" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
        </Button>

        <ConfigGastoFixo
          initial={{ id: categoria.id, nome: categoria.nome, meta: categoria.meta }}
          onSalvarEdit={handleSalvarEdit}
          onOpenChange={setIsEditing} // 🔹 controla se o modal tá aberto
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-600 hover:text-neutral-800"
              title="Editar"
            >
              <Edit3 className="w-5 h-5" />
            </Button>
          }
        />

        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-700"
          onClick={removerCategoria}
          title="Remover categoria"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
