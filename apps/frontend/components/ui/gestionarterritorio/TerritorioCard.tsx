/**
 * Tarjeta de territorio
 * @celula - Celula1
 * Muestra la información resumida de un territorio en la lista del admin.
 */

'use client';

import React from 'react';
import { AdminTerritorio } from '@/models/types';

const ESTADO_COLORS: Record<string, string> = {
  'activo': 'bg-[#10b981]',
  'inactivo': 'bg-[#ef4444]',
  'en_revision': 'bg-[#0cc0df]',
  'rechazado': 'bg-[#E53935]',
  'aceptado': 'bg-[#3b5630]',
};

interface TerritorioCardProps {
  territorio: AdminTerritorio;
  onClick: () => void;
}

export function TerritorioCard({ territorio, onClick }: TerritorioCardProps) {
  const estadoBg = ESTADO_COLORS[territorio.estado_nombre?.toLowerCase()] || 'bg-gray-400';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border-2 border-[#E6D3A3] hover:border-[#3b5630] hover:shadow-md transition-all duration-200 cursor-pointer p-5"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg text-[#231F20]">
            {territorio.nombre_territorio}
          </h3>
          <p className="text-sm text-[#353535]">
            {territorio.region}
          </p>
        </div>
        <span className={`${estadoBg} text-white px-3 py-1 rounded-full text-xs font-bold capitalize`}>
          {territorio.estado_nombre}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-[#353535]">Administrador:</span>
        <span className="text-xs font-medium text-[#3b5630] bg-[#EFF7EA] px-2 py-1 rounded-full">
          {territorio.administrador_nombre}
        </span>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        ID: {territorio.id_territorio}
      </div>
    </div>
  );
}
