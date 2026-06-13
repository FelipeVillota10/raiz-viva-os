/**
 * Badge de resultado de solicitud procesada
 * @celula - Celula1
 * Muestra el badge "Aprobado" o "Rechazado" cuando la solicitud ya fue procesada.
 */

'use client';

import React from 'react';

interface SolicitudResultadoBadgeProps {
  estado: 'APROBADO' | 'RECHAZADO' | string;
}

export function SolicitudResultadoBadge({ estado }: SolicitudResultadoBadgeProps) {
  if (estado === 'APROBADO') {
    return (
      <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#10b981] text-white rounded-full text-sm font-medium">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Aprobado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-full text-sm font-medium">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
      Rechazado
    </span>
  );
}
