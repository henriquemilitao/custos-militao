"use client";

import { useState } from "react";
import { Trash2, CheckCircle, RotateCcw, Plus, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CategoriaFixaType, EstadoMes, GastoGasolina } from "@/app/page";
import ConfigGastoFixo from "./ConfigGastoFixo";

export default function CategoriaFixa({
  categoria,
  estado,
  atualizarEstado,
}: {
  categoria: CategoriaFixaType;
  estado: EstadoMes;
  atualizarEstado: (novoEstado: Partial<EstadoMes>) => void;
}) {
  const isGasolina = categoria.nome.toLowerCase() === "gasolina";
  const [novoValor, setNovoValor] = useState("");

  const formatarData = () => new Date().toLocaleDateString("pt-BR");

  const totalGasto = estado.gasolinaGastos.reduce((sum, g) => sum + g.valor, 0);
  const restante = categoria.meta - totalGasto;
  const percentualUso =
    Math.max(0, Math.min(100, (totalGasto / Math.max(1, categoria.meta)) * 100));

  const adicionarGasolina = () => {
    const valor = parseFloat(novoValor);
    if (!valor || valor <= 0) return;
    const novoGasto: GastoGasolina = {
      id: crypto.randomUUID(),
      data: formatarData(),
      valor,
    };
    atualizarEstado({ gasolinaGastos: [...estado.gasolinaGastos, novoGasto] });
    setNovoValor("");
  };

  const removerGasolina = (id: string) => {
    atualizarEstado({
      gasolinaGastos: estado.gasolinaGastos.filter((g) => g.id !== id),
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
    ? "opacity-80 bg-green-50 border-green-200"
    : "opacity-100 bg-white";

  if (isGasolina) {
    return (
      <div className={`p-4 border rounded-2xl shadow ${paidClasses}`}>
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{categoria.nome}</h3>
          <div className="flex items-center gap-2">
            <ConfigGastoFixo
              initial={{ id: categoria.id, nome: categoria.nome, meta: categoria.meta }}
              onSalvarEdit={handleSalvarEdit}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-neutral-600 hover:text-neutral-800"
                  title="Editar valor estipulado"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={removerCategoria}
              className="text-red-500 hover:text-red-700"
              title="Remover categoria"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Valor estipulado */}
        <div className="mt-2 text-base text-neutral-600">
          
          Valor:{" "}
          <span className="mt-2 text-base text-neutral-600">
            R$ {categoria.meta.toFixed(2)}
          </span>
        </div>

        {/* Gastos e Disponível */}
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-neutral-500">Já gastei</div>
            <div className="font-medium text-base">R$ {totalGasto.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-neutral-500">Posso gastar ainda</div>
            <div
              className={`font-medium text-base ${
                restante >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              R$ {restante.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Barrinha de progresso */}
        <div className="mt-3">
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              style={{ width: `${percentualUso}%` }}
              className={`h-2 ${
                percentualUso > 100 ? "bg-red-400" : "bg-green-500"
              } transition-all`}
            />
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {percentualUso.toFixed(0)}% da meta usada
          </div>
        </div>

        {/* Input + botão */}
        <div className="mt-4 flex items-center gap-2">
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="Valor"
            value={novoValor}
            onChange={(e) => setNovoValor(e.target.value)}
            className="w-32"
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
          {estado.gasolinaGastos.length === 0 ? (
            <li className="text-sm text-neutral-500">Nenhum gasto registrado.</li>
          ) : (
            estado.gasolinaGastos.map((gasto) => (
              <li
                key={gasto.id}
                className="flex justify-between items-center p-2 border rounded bg-gray-50"
              >
                <div className="text-sm">
                  <div className="text-neutral-500 text-xs">{gasto.data}</div>
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

// Categoria comum
  return (
    <div
      className={`p-4 border rounded-2xl shadow flex items-center justify-between transition duration-200 ${
        categoria.pago ? "opacity-80 bg-green-50 border-green-200" : "opacity-100 bg-white"
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

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePago}
          className={categoria.pago ? "text-blue-500" : "text-green-600"}
          title={categoria.pago ? "Desmarcar como pago" : "Marcar como pago"}
        >
          {categoria.pago ? <RotateCcw className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
        </Button>

        <ConfigGastoFixo
          initial={{ id: categoria.id, nome: categoria.nome, meta: categoria.meta }}
          onSalvarEdit={handleSalvarEdit}
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
