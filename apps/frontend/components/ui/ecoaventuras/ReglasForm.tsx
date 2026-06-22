"use client";

import { useState } from "react";
import { Save, X } from "lucide-react";
import { ReglasPaquete } from "@/models/types"; 

interface Props {
  reglas?: ReglasPaquete | null;
  onGuardar: (reglas: ReglasPaquete) => void;
  onCancelar: () => void;
}

export function ReglasForm({ reglas, onGuardar, onCancelar }: Props) {
  const [data, setData] = useState<ReglasPaquete>(reglas || {
    id: 0,
    min_personas: 1,
    max_personas: 10,
    max_actividades: 5,
    fechas_bloqueadas: []
  });

  return (
    <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-emerald-900">Configurar Reglas del Paquete</h2>
        <button onClick={onCancelar} className="text-stone-400 hover:text-stone-600"><X size={20}/></button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-stone-500 uppercase">Mín. Personas</label>
          <input type="number" value={data.min_personas} onChange={e => setData({...data, min_personas: Number(e.target.value)})} className="w-full mt-1 p-2 border rounded-lg" />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-500 uppercase">Máx. Personas</label>
          <input type="number" value={data.max_personas} onChange={e => setData({...data, max_personas: Number(e.target.value)})} className="w-full mt-1 p-2 border rounded-lg" />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs font-semibold text-stone-500 uppercase">Máx. Actividades</label>
        <input type="number" value={data.max_actividades} onChange={e => setData({...data, max_actividades: Number(e.target.value)})} className="w-full mt-1 p-2 border rounded-lg" />
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button onClick={onCancelar} className="px-4 py-2 text-stone-600">Cancelar</button>
        <button onClick={() => onGuardar(data)} className="flex items-center gap-2 bg-[#3a5c2e] text-white px-6 py-2 rounded-lg hover:bg-[#2c4024]">
          <Save size={18} /> Guardar Cambios
        </button>
      </div>
    </div>
  );
}