"use client";

import { useState } from "react";
import { EcoAventura, crearEcoAventura, editarEcoAventura } from "../../../services/ecoaventuras";

interface Props {
  inicial?: EcoAventura | null;
  onGuardado: (eco: EcoAventura) => void;
  onCancelar: () => void;
}

const INPUT =
  "w-full border border-gray-400 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#3b5630] focus:border-[#3b5630] [color-scheme:light]";

const LABEL = "block text-sm font-semibold text-gray-800 mb-1";

export function FormEcoAventura({ inicial, onGuardado, onCancelar }: Props) {
  const [form, setForm] = useState({
    nombre: inicial?.nombre ?? "",
    descripcion: inicial?.descripcion ?? "",
    ubicacion: inicial?.ubicacion ?? "",
    dificultad: inicial?.dificultad ?? "MEDIA",
    duracion: inicial?.duracion ?? 4,
    capacidad_maxima: inicial?.capacidad_maxima ?? 10,
    precio: inicial?.precio ?? "",
    imagen_url: inicial?.imagen_url ?? "",
    fecha_inicio: inicial?.fecha_inicio ?? "",
    fecha_fin: inicial?.fecha_fin ?? "",
    activo: inicial?.activo ?? true,
    territorio: inicial?.territorio ?? 1,
  });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);

  const set = (campo: string, valor: unknown) => setForm((f) => ({ ...f, [campo]: valor }));

  const validar = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = "Obligatorio.";
    if (!form.descripcion.trim()) e.descripcion = "Obligatorio.";
    if (!form.ubicacion.trim()) e.ubicacion = "Obligatorio.";
    if (!form.precio || Number(form.precio) <= 0) e.precio = "Debe ser mayor a 0.";
    if (!form.duracion || form.duracion <= 0) e.duracion = "Mínimo 1 hora.";
    if (!form.capacidad_maxima || form.capacidad_maxima <= 0) e.capacidad_maxima = "Mínimo 1.";
    if (!form.fecha_inicio) e.fecha_inicio = "Obligatorio.";
    if (!form.fecha_fin) e.fecha_fin = "Obligatorio.";
    if (form.fecha_inicio && form.fecha_fin && form.fecha_inicio > form.fecha_fin)
      e.fecha_fin = "No puede ser anterior a la fecha de inicio.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validar();
    if (Object.keys(errs).length > 0) { setErrores(errs); return; }
    setGuardando(true);
    try {
      const payload = { ...form, duracion: Number(form.duracion), capacidad_maxima: Number(form.capacidad_maxima) };
      const resultado = inicial ? await editarEcoAventura(inicial.id, payload) : await crearEcoAventura(payload);
      onGuardado(resultado);
    } catch (err) {
      setErrores({ general: String(err) });
    } finally {
      setGuardando(false);
    }
  };

  const campo = (label: string, key: string, tipo = "text", placeholder = "") => (
    <div>
      <label className={LABEL}>{label}</label>
      <input
        type={tipo}
        placeholder={placeholder}
        value={String((form as Record<string, unknown>)[key] ?? "")}
        onChange={(e) => set(key, tipo === "number" ? Number(e.target.value) : e.target.value)}
        className={INPUT}
      />
      {errores[key] && <p className="mt-1 text-xs text-red-600 font-medium">{errores[key]}</p>}
    </div>
  );

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6" style={{ colorScheme: "light" }}>
      {/* Encabezado */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">
          {inicial ? "Editar Eco-Aventura" : "Nueva Eco-Aventura"}
        </h3>
        <p className="text-sm text-gray-600 mt-1">Los campos marcados con * son obligatorios.</p>
      </div>

      {errores.general && (
        <div className="mb-4 bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-3 font-medium">
          {errores.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Sección: Información básica */}
        <section>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#3b5630] mb-3">
            Información básica
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {campo("Nombre *", "nombre", "text", "Ej: Ruta Ancestral del Cacao")}
            {campo("Ubicación *", "ubicacion", "text", "Ej: Huila, Colombia")}
            <div>
              <label className={LABEL}>Dificultad *</label>
              <select
                value={form.dificultad}
                onChange={(e) => set("dificultad", e.target.value)}
                className={INPUT}
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
              </select>
            </div>
            {campo("Duración (horas) *", "duracion", "number", "Ej: 4")}
          </div>
          <div className="mt-4">
            <label className={LABEL}>Descripción *</label>
            <textarea
              rows={3}
              placeholder="Describe la experiencia: qué vivirá el turista, qué incluye..."
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              className={INPUT + " resize-none"}
            />
            {errores.descripcion && <p className="mt-1 text-xs text-red-600 font-medium">{errores.descripcion}</p>}
          </div>
        </section>

        {/* Sección: Precios y capacidad */}
        <section>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#3b5630] mb-3">
            Precios y capacidad
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {campo("Precio por persona *", "precio", "number", "Ej: 150000")}
            {campo("Capacidad máxima *", "capacidad_maxima", "number", "Ej: 20")}
          </div>
        </section>

        {/* Sección: Fechas y territorio */}
        <section>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#3b5630] mb-3">
            Fechas y territorio
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {campo("Fecha inicio *", "fecha_inicio", "date")}
            {campo("Fecha fin *", "fecha_fin", "date")}
            {campo("ID Territorio *", "territorio", "number", "Ej: 1")}
          </div>
        </section>

        {/* Sección: Imagen y estado */}
        <section>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#3b5630] mb-3">
            Imagen y estado
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {campo("URL de imagen", "imagen_url", "url", "https://...")}
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="activo"
                  checked={form.activo}
                  onChange={(e) => set("activo", e.target.checked)}
                  className="w-5 h-5 accent-[#3b5630] cursor-pointer"
                />
                <span className="text-sm font-semibold text-gray-800">
                  Activa — visible en el catálogo del turista
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Botones */}
        <div className="flex gap-3 pt-2 border-t border-gray-200">
          <button
            type="submit"
            disabled={guardando}
            className="bg-[#3b5630] hover:bg-[#557149] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-60"
          >
            {guardando ? "Guardando..." : inicial ? "Guardar cambios" : "Crear eco-aventura"}
          </button>
          <button
            type="button"
            onClick={onCancelar}
            className="border border-gray-400 text-gray-700 hover:bg-gray-100 px-6 py-2.5 rounded-lg text-sm font-medium transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
