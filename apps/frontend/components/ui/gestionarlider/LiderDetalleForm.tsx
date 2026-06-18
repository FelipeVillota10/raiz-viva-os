/**
 * Formulario de edición del detalle de líder
 * @celula - Celula1
 * Permite editar foto, nombre, email, teléfono, territorio y estado del líder.
 */

'use client';

import React from 'react';
import { Input, Select } from '@/components/ui/base/Input';
import { PerfilActor, AdminTerritorio } from '@/models/types';

interface LiderDetalleFormProps {
  lider: PerfilActor;
  editNombre: string;
  editEmail: string;
  editTelefono: string;
  editActivo: boolean;
  editTerritorioId: string;
  editFoto: File | null;
  fotoPreview: string | null;
  territoriosDisponibles: AdminTerritorio[];
  onChangeNombre: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onChangeTelefono: (v: string) => void;
  onChangeActivo: (v: boolean) => void;
  onChangeTerritorioId: (v: string) => void;
  onChangeFoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LiderDetalleForm({
  lider,
  editNombre,
  editEmail,
  editTelefono,
  editActivo,
  editTerritorioId,
  editFoto,
  fotoPreview,
  territoriosDisponibles,
  onChangeNombre,
  onChangeEmail,
  onChangeTelefono,
  onChangeActivo,
  onChangeTerritorioId,
  onChangeFoto,
}: LiderDetalleFormProps) {
  const fotoSrc = fotoPreview || lider.foto_perfil_url;
  const territorioOptions = [
    { value: '', label: 'Sin territorio' },
    ...territoriosDisponibles.map((t) => ({
      value: String(t.id_territorio),
      label: t.nombre_territorio,
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-20 h-20 rounded-full bg-[#3b5630] flex items-center justify-center text-white font-bold text-2xl overflow-hidden shrink-0">
          {fotoSrc ? (
            <img src={fotoSrc} alt="Foto" className="w-full h-full object-cover" />
          ) : (
            lider.nombre.charAt(0).toUpperCase()
          )}
        </div>
        <label className="cursor-pointer bg-[#F4F1EA] border-2 border-[#E6D3A3] rounded-xl px-4 py-2 text-sm font-medium text-[#231F20] hover:border-[#3b5630] transition">
          Cambiar foto
          <input type="file" accept="image/*" onChange={onChangeFoto} className="hidden" />
        </label>
      </div>

      <Input
        label="Nombre"
        value={editNombre}
        onChange={(e) => onChangeNombre(e.target.value)}
        placeholder="Nombre completo"
      />

      <Input
        label="Correo Electrónico"
        type="email"
        value={editEmail}
        onChange={(e) => onChangeEmail(e.target.value)}
        placeholder="correo@ejemplo.com"
      />

      <Input
        label="Teléfono"
        value={editTelefono}
        onChange={(e) => onChangeTelefono(e.target.value)}
        placeholder="Número de teléfono"
      />

      <Select
        label="Territorio"
        value={editTerritorioId}
        onChange={(e) => onChangeTerritorioId(e.target.value)}
        options={territorioOptions}
      />

      <div className="flex items-center gap-3">
        <label className="text-base font-bold text-[#231F20]">Estado</label>
        <button
          type="button"
          onClick={() => onChangeActivo(!editActivo)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            editActivo ? 'bg-[#10b981]' : 'bg-[#ef4444]'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              editActivo ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm text-[#353535]">
          {editActivo ? 'Activo' : 'Inactivo'}
        </span>
      </div>
    </div>
  );
}
