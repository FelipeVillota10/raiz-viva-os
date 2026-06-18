/**
 * Tarjeta de solicitud de aprobación
 * @celula - Celula1
 * Muestra la información resumida de una solicitud en la lista del líder.
 */

'use client';

import React from 'react';
import { Solicitud } from '@/models/types';

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  EN_REVISION: { label: 'En Revisión', color: 'text-white', bg: 'bg-[#0cc0df]' },
  APROBADO: { label: 'Aprobado', color: 'text-white', bg: 'bg-[#10b981]' },
  RECHAZADO: { label: 'Rechazado', color: 'text-white', bg: 'bg-[#ef4444]' },
};

interface SolicitudCardProps {
  solicitud: Solicitud;
  onClick: () => void;
}

export function SolicitudCard({ solicitud, onClick }: SolicitudCardProps) {
  const estado = ESTADO_CONFIG[solicitud.estado_resultado] || ESTADO_CONFIG['EN_REVISION'];
  const primerTipo = solicitud.actor_info.tipos_actores[0];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border-2 border-[#E6D3A3] hover:border-[#3b5630] hover:shadow-md transition-all duration-200 cursor-pointer p-5"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-[#231F20]">
            {solicitud.actor_info.nombre}
          </h3>
          <p className="text-sm text-[#353535]">
            {solicitud.actor_info.telefono} · {solicitud.actor_info.territorio_nombre || 'Sin territorio'}
          </p>
        </div>
        <span className={`${estado.bg} ${estado.color} px-3 py-1 rounded-full text-xs font-bold`}>
          {estado.label}
        </span>
      </div>

      <p className="text-sm text-[#353535] mb-2">
        <span className="font-medium">Solicita aprobación para:</span> {solicitud.actor_info.nombre || 'Sin nombre'}
      </p>

      {primerTipo && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-[#3b5630] bg-[#EFF7EA] px-2 py-1 rounded-full capitalize">
            {primerTipo.nombre_tipo}
          </span>
          {solicitud.actor_info.tipos_actores.length > 1 && (
            <span className="text-xs text-[#353535]">
              +{solicitud.actor_info.tipos_actores.length - 1} más
            </span>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Solicitado el {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-CO', {
          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })}
      </p>
    </div>
  );
}
