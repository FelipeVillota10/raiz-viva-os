"use client";

import { useState } from "react";
import { usePaquete } from "@/components/ecoaventuras/PaqueteContext";

interface Props {
  ecoaventuraId: number;
  precio: number;
  capacidadMaxima: number;
}

export default function BotonAgregarPaquete({ ecoaventuraId, precio, capacidadMaxima }: Props) {
  const { agregar, agregando } = usePaquete();
  const [fechaReserva, setFechaReserva] = useState<string>("");
  const [numPersonas, setNumPersonas] = useState(1);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "exito" | "error" | "duplicado" } | null>(null);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  const hoy = new Date().toISOString().split("T")[0];

  async function handleAgregar() {
    setMensaje(null);

    if (numPersonas > capacidadMaxima) {
      setMensaje({ texto: `Máximo ${capacidadMaxima} personas permitidas.`, tipo: "error" });
      return;
    }

    const result = await agregar({
      ecoaventura_id: ecoaventuraId,
      fecha_reserva: fechaReserva || null,
      num_personas: numPersonas,
    });

    if (result.exito) {
      setMensaje({ texto: "¡Agregado a tu paquete!", tipo: "exito" });
      setMostrarOpciones(false);
    } else if (result.mensaje?.includes("misma configuración") || result.mensaje?.includes("duplicada")) {
      setMensaje({ texto: "Ya agregaste esta experiencia con esa configuración.", tipo: "duplicado" });
    } else {
      setMensaje({ texto: result.mensaje || "Error al agregar.", tipo: "error" });
    }

    setTimeout(() => setMensaje(null), 4000);
  }

  return (
    <div className="relative">
      {!mostrarOpciones ? (
        <button
          onClick={() => setMostrarOpciones(true)}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar a mi paquete
        </button>
      ) : (
        <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-xl space-y-4 text-gray-800">
          <p className="text-sm font-semibold text-gray-700">Configura tu experiencia</p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fecha de reserva (opcional)</label>
              <input
                type="date"
                min={hoy}
                value={fechaReserva}
                onChange={(e) => setFechaReserva(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Número de personas
                <span className="ml-1 text-emerald-600">(máx. {capacidadMaxima})</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setNumPersonas((n) => Math.max(1, n - 1))}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition"
                >
                  −
                </button>
                <span className="text-sm font-semibold w-6 text-center text-gray-800">{numPersonas}</span>
                <button
                  onClick={() => setNumPersonas((n) => Math.min(capacidadMaxima, n + 1))}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-gray-100">
              <p className="text-xs text-gray-500">Subtotal estimado</p>
              <p className="text-sm font-bold text-emerald-700">
                ${(precio * numPersonas).toLocaleString("es-CO")}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setMostrarOpciones(false)}
              className="flex-1 py-2 px-4 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleAgregar}
              disabled={agregando}
              className="flex-1 py-2 px-4 text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              {agregando ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                "Confirmar"
              )}
            </button>
          </div>
        </div>
      )}

      {mensaje && (
        <div
          className={`mt-2 px-4 py-2 rounded-xl text-sm font-medium text-center transition-all ${
            mensaje.tipo === "exito"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : mensaje.tipo === "duplicado"
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {mensaje.texto}
        </div>
      )}
    </div>
  );
}