/**
 * Header del detalle de líder
 * @celula - Celula1
 * Muestra el título y los botones de editar/cancelar/guardar.
 */

'use client';

import React from 'react';

interface LiderDetalleHeaderProps {
  isEditing: boolean;
  saving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function LiderDetalleHeader({
  isEditing,
  saving,
  onEdit,
  onCancel,
  onSave,
}: LiderDetalleHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-[#557149]">Detalle del Líder</h1>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={onCancel}
              className="bg-white/20 hover:bg-white/30 text-[#231F20] p-2 rounded-full transition border border-[#E6D3A3]"
              title="Cancelar cambios"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="bg-white/20 hover:bg-white/30 text-[#231F20] p-2 rounded-full transition border border-[#E6D3A3] disabled:opacity-50"
              title="Guardar cambios"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="bg-white/20 hover:bg-white/30 text-[#231F20] p-2 rounded-full transition border border-[#E6D3A3]"
            title="Editar líder"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
