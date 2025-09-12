"use client";

import { useState } from "react";
import { MoreVertical, Edit, Trash2, CheckCircle, Plus } from "lucide-react";
import { TipoGastoSelect } from "./testeTipoGastoSelect";

type GastoSimples = {
  id: number;
  nome: string;
  valor: number;
  pago: boolean;
  data?: string;
  tipo: "simples";
};

type GastoMeta = {
  id: number;
  nome: string;
  meta: number;
  gasto: number;
  tipo: "meta";
};

type Gasto = GastoSimples | GastoMeta;

export default function GastosCard() {
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState<number | null>(null);

  const [gastos, setGastos] = useState<Gasto[]>([
    {
      id: 1,
      nome: "Internet",
      valor: 100,
      pago: true,
      data: "05/09/2025",
      tipo: "simples",
    },
    {
      id: 2,
      nome: "Gasolina",
      meta: 400,
      gasto: 250,
      tipo: "meta",
    },
  ]);

  // 🔹 Função auxiliar para barra de progresso
  const ProgressBar = ({ percent }: { percent: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-500 h-2 rounded-full"
        style={{ width: `${percent}%` }}
      />
    </div>
  );

  return (
    <div className="p-4 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Gastos</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-600"
          >
            <Plus size={15} />
          </button>
        </div>

        <div className="space-y-3">
          {gastos.map((gasto) => (
            <div
              key={gasto.id}
              className={`p-3 rounded-xl border ${
                gasto.tipo === "simples" && gasto.pago
                  ? "bg-green-100 border-green-300 opacity-90"
                  : gasto.tipo === "meta"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-200"
              } flex justify-between items-start`}
            >
              <div className="flex flex-col flex-1">
                {/* Cabeçalho */}
                <div className="flex items-center gap-2">
                  {gasto.tipo === "simples" && gasto.pago && (
                    <CheckCircle size={18} className="text-green-600" />
                  )}
                  <p
                    className={`font-medium text-gray-800 ${
                      gasto.tipo === "simples" && gasto.pago
                        ? "line-through text-gray-600"
                        : ""
                    }`}
                  >
                    {gasto.nome}
                  </p>
                </div>

                {/* Simples */}
                {gasto.tipo === "simples" && (
                  <>
                    <p className="text-sm text-gray-500">
                      Valor: R$ {gasto.valor.toFixed(2)}
                    </p>
                    {gasto.pago && gasto.data && (
                      <p className="text-xs text-gray-400">
                        Pago em {gasto.data}
                      </p>
                    )}
                  </>
                )}

                {/* Meta */}
                {gasto.tipo === "meta" && (
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-gray-500">
                      Meta:{" "}
                      <span className="font-medium">
                        R$ {gasto.meta.toFixed(2)}
                      </span>
                    </p>
                    <p className="text-gray-500">
                      Já gastei:{" "}
                      <span className="font-medium text-red-500">
                        R$ {gasto.gasto.toFixed(2)}
                      </span>
                    </p>
                    <p className="text-gray-500">
                      Disponível:{" "}
                      <span className="font-medium text-green-600">
                        R$ {(gasto.meta - gasto.gasto).toFixed(2)}
                      </span>
                    </p>
                    {/* Barrinha */}
                    <ProgressBar
                      percent={Math.min((gasto.gasto / gasto.meta) * 100, 100)}
                    />
                    <p className="text-xs text-gray-400">
                      Gastei {((gasto.gasto / gasto.meta) * 100).toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>

              {/* Menu */}
              <div className="relative ml-2">
                <button
                  onClick={() =>
                    setShowMenu(showMenu === gasto.id ? null : gasto.id)
                  }
                  className="p-1 rounded-full hover:bg-gray-200"
                >
                  <MoreVertical size={18} />
                </button>

                {showMenu === gasto.id && (
                  <div className="absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-xl border z-10">
                    {gasto.tipo === "simples" && !gasto.pago && (
                      <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100">
                        <CheckCircle
                          size={16}
                          className="text-green-500"
                        />{" "}
                        Pagar
                      </button>
                    )}
                    <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100">
                      <Edit size={16} className="text-blue-500" /> Editar
                    </button>
                    <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100">
                      <Trash2 size={16} className="text-red-500" /> Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-20">
          <div className="bg-white p-6 rounded-2xl w-80 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Novo Gasto</h3>
            <input
              type="text"
              placeholder="Nome"
              className="w-full mb-3 px-3 py-2 border rounded-xl focus:outline-blue-500"
            />
            <input
              type="number"
              placeholder="Valor ou Meta (R$)"
              className="w-full mb-4 px-3 py-2 border rounded-xl focus:outline-blue-500"
            />

            {/* <select className="w-full mb-4 px-3 py-2 border rounded-xl focus:outline-blue-500">
              <option value="simples">Gasto Simples</option>
              <option value="meta">Gasto com Meta</option>
            </select> */}
            <TipoGastoSelect />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
