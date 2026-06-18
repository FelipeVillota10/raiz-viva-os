/**
 * Vista de solo lectura del detalle de territorio
 * @celula - Celula1
 * Muestra nombre, región y estado del territorio.
 */

'use client';

import React from 'react';
import { AdminTerritorio } from '@/models/types';

interface TerritorioDetalleViewProps {
  territorio: AdminTerritorio;
}

export function TerritorioDetalleView({ territorio }: TerritorioDetalleViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-[#353535]">Nombre</p>
        <p className="font-medium text-[#231F20]">{territorio.nombre_territorio}</p>
      </div>
      <div>
        <p className="text-sm text-[#353535]">Región</p>
        <p className="font-medium text-[#231F20]">{territorio.region}</p>
      </div>
      <div>
        <p className="text-sm text-[#353535]">Estado</p>
        <span
          className={`inline-block mt-1 text-white px-3 py-1 rounded-full text-xs font-bold capitalize ${
            territorio.estado_nombre?.toLowerCase() === 'activo' ? 'bg-[#10b981]' : 'bg-[#ef4444]'
          }`}
        >
          {territorio.estado_nombre}
        </span>
      </div>
    </div>
  );
}
