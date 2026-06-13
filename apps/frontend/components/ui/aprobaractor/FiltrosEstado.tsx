/**
 * Filtros por estado de solicitud
 * @celula - Celula1
 * Chips para filtrar solicitudes por estado (Todas, En Revisión, Aprobado, Rechazado).
 */

'use client';

import React from 'react';

interface FiltrosEstadoProps {
  filtroActual: string;
  onChange: (estado: string) => void;
}

const ESTADOS: { value: string; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'EN_REVISION', label: 'En Revisión' },
  { value: 'APROBADO', label: 'Aprobado' },
  { value: 'RECHAZADO', label: 'Rechazado' },
];

export function FiltrosEstado({ filtroActual, onChange }: FiltrosEstadoProps) {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {ESTADOS.map((estado) => {
        const active = filtroActual === estado.value;
        return (
          <button
            key={estado.value}
            onClick={() => onChange(estado.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
              active
                ? 'bg-[#3b5630] text-white'
                : 'bg-white text-[#353535] border border-[#8c9a80] hover:bg-[#EFF7EA]'
            }`}
          >
            {estado.label}
          </button>
        );
      })}
    </div>
  );
}
