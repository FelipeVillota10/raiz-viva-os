"use client";

import { useState, useEffect } from "react";
import { Itinerario, getItinerario, guardarItinerario } from "../../../services/ecoaventuras";

interface Props {
  ecoaventuraId: number;
  nombreEco: string;
  onCerrar: () => void;
}

const VACIO: Itinerario = {
  cronograma: "", actividades: "", transporte: "",
  restricciones: "", recomendaciones: "", contactos: "", notas_especiales: "",
};

const CAMPOS: { key: keyof Itinerario; label: string; placeholder: string }[] = [
  { key: "cronograma", label: "Cronograma", placeholder: "Ej: 7am Llegada, 8am Desayuno..." },
  { key: "actividades", label: "Actividades", placeholder: "Describe las actividades del recorrido..." },
  { key: "transporte", label: "Transporte", placeholder: "Ej: Bus desde Bogotá, punto de encuentro..." },
  { key: "restricciones", label: "Restricciones", placeholder: "Ej: No apto para menores de 12 años..." },
  { key: "recomendaciones", label: "Recomendaciones", placeholder: "Ej: Llevar ropa cómoda, protector solar..." },
  { key: "contactos", label: "Contactos", placeholder: "Ej: Guía: 310 000 0000..." },
  { key: "notas_especiales", label: "Notas especiales", placeholder: "Información adicional..." },
];

export function FormItinerario({ ecoaventuraId, nombreEco, onCerrar }: Props) {
  const [form, setForm] = useState<Itinerario>(VACIO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getItinerario(ecoaventuraId).then((it) => { if (it) setForm(it); }).finally(() => setCargando(false));
  }, [ecoaventuraId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await guardarItinerario(ecoaventuraId, form);
      setExito(true);
      setTimeout(() => setExito(false), 2500);
    } catch {
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="font-semibold text-[#3b5630] text-lg">Itinerario & Logística</h3>
            <p className="text-sm text-gray-400">{nombreEco}</p>
          </div>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {cargando ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Cargando...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
            {exito && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">✓ Guardado correctamente.</div>}
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">{error}</div>}

            {CAMPOS.map(({ key, label, placeholder }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">{label}</label>
                <textarea rows={2} placeholder={placeholder} value={form[key] as string}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none" />
              </div>
            ))}

            <div className="flex gap-3 mt-2">
              <button type="submit" disabled={guardando}
                className="bg-[#3b5630] hover:bg-[#557149] text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60">
                {guardando ? "Guardando..." : "Guardar itinerario"}
              </button>
              <button type="button" onClick={onCerrar}
                className="border border-gray-200 hover:bg-gray-50 px-5 py-2 rounded-lg text-sm transition">
                Cerrar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
