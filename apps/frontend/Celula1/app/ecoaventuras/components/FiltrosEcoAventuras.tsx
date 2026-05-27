"use client";

import { Filtros } from "../../services/ecoaventuras";

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

const INPUT =
  "w-full border border-gray-400 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b5630] focus:border-[#3b5630] [color-scheme:light]";

const LABEL = "block text-sm font-semibold text-gray-800 mb-1";

export function FiltrosEcoAventuras({ filtros, onChange, onLimpiar }: Props) {
  const set = (campo: keyof Filtros, valor: string) =>
    onChange({ ...filtros, [campo]: valor, page: 1 });

  return (
    <aside
      className="w-full lg:w-64 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-5 h-fit sticky top-4"
      style={{ colorScheme: "light" }}
    >
      {/* Encabezado */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <h2 className="font-bold text-gray-900 text-base">Filtros</h2>
        <button
          onClick={onLimpiar}
          className="text-xs font-medium text-gray-500 hover:text-red-600 transition"
        >
          Limpiar todo
        </button>
      </div>

      {/* Precio */}
      <div>
        <label className={LABEL}>Precio (COP)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={filtros.precio_min ?? ""}
            onChange={(e) => set("precio_min", e.target.value)}
            className={INPUT}
          />
          <input
            type="number"
            placeholder="Máx"
            value={filtros.precio_max ?? ""}
            onChange={(e) => set("precio_max", e.target.value)}
            className={INPUT}
          />
        </div>
      </div>

      {/* Dificultad */}
      <div>
        <p className={LABEL}>Dificultad</p>
        <div className="flex flex-col gap-2 mt-1">
          {DIFICULTADES.map((d) => (
            <label key={d.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="dificultad"
                value={d.value}
                checked={(filtros.dificultad ?? "") === d.value}
                onChange={() => set("dificultad", d.value)}
                className="w-4 h-4 accent-[#3b5630] cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-800 group-hover:text-[#3b5630] transition">
                {d.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Duración */}
      <div>
        <label className={LABEL}>Duración (horas)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={filtros.duracion_min ?? ""}
            onChange={(e) => set("duracion_min", e.target.value)}
            className={INPUT}
          />
          <input
            type="number"
            placeholder="Máx"
            value={filtros.duracion_max ?? ""}
            onChange={(e) => set("duracion_max", e.target.value)}
            className={INPUT}
          />
        </div>
      </div>

      {/* Ubicación */}
      <div>
        <label className={LABEL}>Ubicación</label>
        <input
          type="text"
          placeholder="Ej: Huila, Boyacá..."
          value={filtros.ubicacion ?? ""}
          onChange={(e) => set("ubicacion", e.target.value)}
          className={INPUT}
        />
      </div>
    </aside>
  );
}
