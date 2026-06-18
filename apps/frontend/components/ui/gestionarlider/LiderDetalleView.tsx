/**
 * Vista de solo lectura del detalle de líder
 * @celula - Celula1
 * Muestra foto, nombre, email, teléfono y territorio del líder.
 */

'use client';

import React from 'react';
import { PerfilActor } from '@/models/types';

interface LiderDetalleViewProps {
  lider: PerfilActor;
}

export function LiderDetalleView({ lider }: LiderDetalleViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2 flex items-center gap-4 mb-2">
        <div className="w-16 h-16 rounded-full bg-[#3b5630] flex items-center justify-center text-white font-bold text-xl overflow-hidden">
          {lider.foto_perfil_url ? (
            <img src={lider.foto_perfil_url} alt="Foto" className="w-full h-full object-cover" />
          ) : (
            lider.nombre.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="font-semibold text-lg text-[#231F20]">{lider.nombre}</p>
          <p className="text-sm text-[#353535]">{lider.usuario_email}</p>
        </div>
      </div>
      <div>
        <p className="text-sm text-[#353535]">Teléfono</p>
        <p className="font-medium text-[#231F20]">{lider.telefono || '—'}</p>
      </div>
      <div>
        <p className="text-sm text-[#353535]">Territorio</p>
        <p className="font-medium text-[#231F20]">{lider.territorio_nombre || 'Sin territorio'}</p>
      </div>
    </div>
  );
}
