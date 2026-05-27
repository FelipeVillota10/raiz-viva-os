"use client";

import { Filtros } from "../services/ecoaventuras";

interface Props {
  filtros: Filtros;
  onChange: (filtros: Filtros) => void;
  onLimpiar: () => void;
}

const DIFICULTADES = [
  { value: "", label: "Todas" },
  { value: "BAJA", label: "Baja" },
  { value: "MEDIA", label: "Media" },
  { value: "ALTA", label: "Alta" },
];

export function FiltrosEcoAventuras({ filtros, onChange, onLimpiar }: Props) {
  const set = (campo: keyof Filtros, valor: string) =>
    onChange({ ...filtros, [campo]: valor, page: 1 });

  return (
    <aside className="w-full lg:w-64 bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-5 h-fit sticky top-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[#3a5c2e] text-base">Filtros</h2>
        <button
          onClick={onLimpiar}
          className="text-xs text-gray-400 hover:text-red-500 transition"
        >
          Limpiar
        </button>
      </div>

      {/* Precio */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-600">Precio (USD)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filtros.precio_min ?? ""}
            onChange={(e) => set("precio_min", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <input
            type="number"
            placeholder="Máx"
            value={filtros.precio_max ?? ""}
            onChange={(e) => set("precio_max", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
      </div>

      {/* Dificultad */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-600">Dificultad</label>
        <div className="flex flex-col gap-1">
          {DIFICULTADES.map((d) => (
            <label key={d.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="dificultad"
                value={d.value}
                checked={(filtros.dificultad ?? "") === d.value}
                onChange={() => set("dificultad", d.value)}
                className="accent-green-600"
              />
              {d.label}
            </label>
          ))}
        </div>
      </div>

      {/* Duración */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-600">Duración (horas)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filtros.duracion_min ?? ""}
            onChange={(e) => set("duracion_min", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <input
            type="number"
            placeholder="Máx"
            value={filtros.duracion_max ?? ""}
            onChange={(e) => set("duracion_max", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
      </div>

      {/* Ubicación */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-600">Ubicación</label>
        <input
          type="text"
          placeholder="Ej: Huila, Boyacá..."
          value={filtros.ubicacion ?? ""}
          onChange={(e) => set("ubicacion", e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
        />
      </div>
    </aside>
  );
}
