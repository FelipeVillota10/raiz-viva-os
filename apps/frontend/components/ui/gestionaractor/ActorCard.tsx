/**
 * Tarjeta de actor territorial
 * @celula - Celula1
 * Muestra la información de un actor en la lista del líder.
 * Incluye botón para habilitar/inhabilitar.
 */

'use client';

import React from 'react';
import { ActorTerritorial } from '@/models/types';

interface ActorCardProps {
  actor: ActorTerritorial;
  onToggle: (actor: ActorTerritorial) => void;
}

export function ActorCard({ actor, onToggle }: ActorCardProps) {
  const primerTipo = actor.tipos_actores[0];

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border-2 p-5 transition-all duration-200 ${
        actor.activo ? 'border-[#E6D3A3]' : 'border-gray-200 opacity-75'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-[#231F20]">{actor.nombre}</h3>
          <p className="text-sm text-[#353535]">
            {actor.telefono} · {actor.territorio_nombre || 'Sin territorio'}
          </p>
          <p className="text-sm text-[#353535]">{actor.email}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
              actor.activo ? 'bg-[#10b981]' : 'bg-[#ef4444]'
            }`}
          >
            {actor.activo ? 'Activo' : 'Inactivo'}
          </span>
          {actor.activo ? (
            <button
              onClick={() => onToggle(actor)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition cursor-pointer"
            >
              Inhabilitar
            </button>
          ) : (
            <button
              onClick={() => onToggle(actor)}
              className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-1.5 rounded-full text-sm font-medium transition cursor-pointer"
            >
              Habilitar
            </button>
          )}
        </div>
      </div>

      {primerTipo && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-[#3b5630] bg-[#EFF7EA] px-2 py-1 rounded-full capitalize">
            {primerTipo.nombre_tipo}
          </span>
          {actor.tipos_actores.length > 1 && (
            <span className="text-xs text-[#353535]">
              +{actor.tipos_actores.length - 1} más
            </span>
          )}
        </div>
      )}
    </div>
  );
}
