/**
 * Formulario de edición del detalle de territorio
 * @celula - Celula1
 * Permite editar nombre, región, estado del territorio y estado del administrador.
 */

'use client';

import React from 'react';
import { Input } from '@/components/ui/base/Input';
import { AdminTerritorio } from '@/models/types';

interface TerritorioDetalleFormProps {
  territorio: AdminTerritorio;
  editNombre: string;
  editRegion: string;
  editEstadoActivo: boolean;
  editAdminActivo: boolean;
  onChangeNombre: (v: string) => void;
  onChangeRegion: (v: string) => void;
  onChangeEstadoActivo: (v: boolean) => void;
  onChangeAdminActivo: (v: boolean) => void;
}

export function TerritorioDetalleForm({
  territorio,
  editNombre,
  editRegion,
  editEstadoActivo,
  editAdminActivo,
  onChangeNombre,
  onChangeRegion,
  onChangeEstadoActivo,
  onChangeAdminActivo,
}: TerritorioDetalleFormProps) {
  return (
    <div className="space-y-4">
      <Input
        label="Nombre del Territorio"
        value={editNombre}
        onChange={(e) => onChangeNombre(e.target.value)}
        placeholder="Ej: Buitrera"
      />
      <Input
        label="Región"
        value={editRegion}
        onChange={(e) => onChangeRegion(e.target.value)}
        placeholder="Ej: Zona Rural Palmira"
      />
      <div className="flex items-center gap-3">
        <label className="text-base font-bold text-[#231F20]">Estado del territorio</label>
        <button
          type="button"
          onClick={() => onChangeEstadoActivo(!editEstadoActivo)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            editEstadoActivo ? 'bg-[#10b981]' : 'bg-[#ef4444]'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              editEstadoActivo ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm text-[#353535]">
          {editEstadoActivo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {territorio.administrador_nombre && (
        <div className="pt-2 border-t border-[#E6D3A3]">
          <p className="text-sm font-bold text-[#231F20] mb-2">
            Administrador: {territorio.administrador_nombre}
          </p>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#353535]">Estado del líder</label>
            <button
              type="button"
              onClick={() => onChangeAdminActivo(!editAdminActivo)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                editAdminActivo ? 'bg-[#10b981]' : 'bg-[#ef4444]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  editAdminActivo ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-[#353535]">
              {editAdminActivo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
