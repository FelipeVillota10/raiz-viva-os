"use client";

import { useState } from "react";
import { EcoAventura, crearEcoAventura, editarEcoAventura } from "@/services/ecoaventuras";

interface Props {
  inicial?: EcoAventura | null;
  onGuardado: (eco: EcoAventura) => void;
  onCancelar: () => void;
}

const VACIO = {
  nombre: "",
  descripcion: "",
  ubicacion: "",
  dificultad: "MEDIA" as const,
  duracion: 4,
  capacidad_maxima: 10,
  precio: "",
  imagen_url: "",
  fecha_inicio: "",
  fecha_fin: "",
  activo: true,
  territorio: 1,
};

export function FormEcoAventura({ inicial, onGuardado, onCancelar }: Props) {
  const [form, setForm] = useState({
    nombre: inicial?.nombre ?? VACIO.nombre,
    descripcion: inicial?.descripcion ?? VACIO.descripcion,
    ubicacion: inicial?.ubicacion ?? VACIO.ubicacion,
    dificultad: inicial?.dificultad ?? VACIO.dificultad,
    duracion: inicial?.duracion ?? VACIO.duracion,
    capacidad_maxima: inicial?.capacidad_maxima ?? VACIO.capacidad_maxima,
    precio: inicial?.precio ?? VACIO.precio,
    imagen_url: inicial?.imagen_url ?? VACIO.imagen_url,
    fecha_inicio: inicial?.fecha_inicio ?? VACIO.fecha_inicio,
    fecha_fin: inicial?.fecha_fin ?? VACIO.fecha_fin,
    activo: inicial?.activo ?? VACIO.activo,
    territorio: inicial?.territorio ?? VACIO.territorio,
  });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);

  const set = (campo: string, valor: unknown) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  const validar = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio.";
    if (!form.descripcion.trim()) e.descripcion = "La descripción es obligatoria.";
    if (!form.ubicacion.trim()) e.ubicacion = "La ubicación es obligatoria.";
    if (!form.precio || Number(form.precio) <= 0) e.precio = "El precio debe ser mayor a 0.";
    if (!form.duracion || form.duracion <= 0) e.duracion = "La duración debe ser al menos 1 hora.";
    if (!form.capacidad_maxima || form.capacidad_maxima <= 0) e.capacidad_maxima = "La capacidad debe ser al menos 1.";
    if (!form.fecha_inicio) e.fecha_inicio = "La fecha de inicio es obligatoria.";
    if (!form.fecha_fin) e.fecha_fin = "La fecha de fin es obligatoria.";
    if (form.fecha_inicio && form.fecha_fin && form.fecha_inicio > form.fecha_fin)
      e.fecha_fin = "La fecha de fin no puede ser anterior a la de inicio.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e2 = validar();
    if (Object.keys(e2).length > 0) { setErrores(e2); return; }
    setGuardando(true);
    try {
      const payload = { ...form, precio: form.precio, duracion: Number(form.duracion), capacidad_maxima: Number(form.capacidad_maxima) };
      const resultado = inicial
        ? await editarEcoAventura(inicial.id, payload)
        : await crearEcoAventura(payload);
      onGuardado(resultado);
    } catch (err) {
      setErrores({ general: String(err) });
    } finally {
      setGuardando(false);
    }
  };

  const campo = (label: string, key: string, tipo = "text", extra?: object) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <input
        type={tipo}
        value={String((form as Record<string, unknown>)[key] ?? "")}
        onChange={(e) => set(key, tipo === "number" ? Number(e.target.value) : e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
        {...extra}
      />
      {errores[key] && <span className="text-red-500 text-xs">{errores[key]}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
      <h3 className="font-semibold text-[#3a5c2e] text-lg">
        {inicial ? "Editar Eco-Aventura" : "Nueva Eco-Aventura"}
      </h3>

      {errores.general && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
          {errores.general}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {campo("Nombre *", "nombre")}
        {campo("Ubicación *", "ubicacion")}
        {campo("Precio (USD) *", "precio", "number")}
        {campo("Duración (horas) *", "duracion", "number")}
        {campo("Capacidad máxima *", "capacidad_maxima", "number")}
        {campo("ID Territorio *", "territorio", "number")}
        {campo("Fecha de inicio *", "fecha_inicio", "date")}
        {campo("Fecha de fin *", "fecha_fin", "date")}
        {campo("URL de imagen", "imagen_url", "url")}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-600">Dificultad *</label>
          <select
            value={form.dificultad}
            onChange={(e) => set("dificultad", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600">Descripción *</label>
        <textarea
          rows={3}
          value={form.descripcion}
          onChange={(e) => set("descripcion", e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
        />
        {errores.descripcion && <span className="text-red-500 text-xs">{errores.descripcion}</span>}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="activo"
          checked={form.activo}
          onChange={(e) => set("activo", e.target.checked)}
          className="accent-green-600"
        />
        <label htmlFor="activo" className="text-sm text-gray-600">
          Activa (visible en el catálogo)
        </label>
      </div>

      <div className="flex gap-3 mt-2">
        <button
          type="submit"
          disabled={guardando}
          className="bg-[#3a5c2e] hover:bg-[#557149] text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60"
        >
          {guardando ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="border border-gray-200 hover:bg-gray-50 px-5 py-2 rounded-lg text-sm transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
