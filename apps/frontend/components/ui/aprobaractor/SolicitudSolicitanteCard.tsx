/**
 * Tarjeta con los datos del solicitante
 * @celula - Celula1
 * Muestra nombre, email, teléfono, territorio, servicio y tipos del actor solicitante.
 */

'use client';

import React from 'react';
import { Solicitud } from '@/models/types';

interface SolicitudSolicitanteCardProps {
  solicitud: Solicitud;
}

export function SolicitudSolicitanteCard({ solicitud }: SolicitudSolicitanteCardProps) {
  const tiposActores = solicitud.actor_info.tipos_actores || [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-[#E6D3A3] p-6 mb-6">
      <h2 className="text-xl font-semibold text-[#231F20] mb-4">Información del Solicitante</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-[#353535]">Nombre del Negocio</p>
          <p className="font-medium text-[#231F20]">{solicitud.actor_info.nombre}</p>
        </div>
        <div>
          <p className="text-sm text-[#353535]">Correo electrónico</p>
          <p className="font-medium text-[#231F20]">{solicitud.actor_info.usuario_email}</p>
        </div>
        <div>
          <p className="text-sm text-[#353535]">Teléfono</p>
          <p className="font-medium text-[#231F20]">{solicitud.actor_info.telefono}</p>
        </div>
        <div>
          <p className="text-sm text-[#353535]">Territorio</p>
          <p className="font-medium text-[#231F20]">{solicitud.actor_info.territorio_nombre || 'No asignado'}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-[#353535]">Servicio / Descripción</p>
        <p className="font-medium text-[#231F20]">{solicitud.actor_info.servicio || 'Sin descripción'}</p>
      </div>

      <div className="mt-4">
        <p className="text-sm text-[#353535] mb-2">Tipos de Actor</p>
        <div className="flex gap-2 flex-wrap">
          {tiposActores.map((tipo) => (
            <span
              key={tipo.id}
              className="bg-[#EFF7EA] text-[#3b5630] px-3 py-1 rounded-full text-sm font-medium capitalize"
            >
              {tipo.nombre_tipo}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
