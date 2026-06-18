/**
 * Badge de estado
 * @celula - Celula1
 * Pill reutilizable para mostrar el estado (En Revisión, Aprobado, Rechazado).
 */

'use client';

import React from 'react';

interface EstadoBadgeProps {
  estado: string;
}

const ESTADO_CONFIG: Record<string, { label: string; bg: string }> = {
  EN_REVISION: { label: 'En Revisión', bg: 'bg-[#0cc0df]' },
  APROBADO: { label: 'Aprobado', bg: 'bg-[#10b981]' },
  RECHAZADO: { label: 'Rechazado', bg: 'bg-[#ef4444]' },
};

export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const config = ESTADO_CONFIG[estado] || { label: estado, bg: 'bg-gray-400' };
  return (
    <span className={`${config.bg} text-white px-3 py-1 rounded-full text-xs font-bold`}>
      {config.label}
    </span>
  );
}
