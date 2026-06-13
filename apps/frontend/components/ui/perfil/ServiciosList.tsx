/**
 * Lista de servicios del actor territorial
 * @celula - Celula1
 * Muestra los servicios asignados al perfil del actor.
 * En modo edición permite añadir y eliminar servicios.
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/base/Button';
import { Input, Select } from '@/components/ui/base/Input';
import { ServicioPerfil } from '@/models/types';

interface CatalogoServicio {
  id: number;
  nombre: string;
}

interface ServiciosListProps {
  servicios: ServicioPerfil[];
  serviciosCatalogo: CatalogoServicio[];
  isEditing: boolean;
  showAddServicio: boolean;
  newServicioId: string;
  newServicioPrecio: string;
  addingServicio: boolean;
  setNewServicioId: (v: string) => void;
  setNewServicioPrecio: (v: string) => void;
  setShowAddServicio: (v: boolean) => void;
  handleAddServicio: () => void;
  handleDeleteServicio: (id: number) => void;
}

export function ServiciosList({
  servicios,
  serviciosCatalogo,
  isEditing,
  showAddServicio,
  newServicioId,
  newServicioPrecio,
  addingServicio,
  setNewServicioId,
  setNewServicioPrecio,
  setShowAddServicio,
  handleAddServicio,
  handleDeleteServicio,
}: ServiciosListProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-[#231F20]">Servicios / Negocios</h3>
        {isEditing && (
          <button
            type="button"
            onClick={() => setShowAddServicio(!showAddServicio)}
            className="text-sm text-[#3b5630] hover:underline font-medium"
          >
            + Añadir
          </button>
        )}
      </div>

      {showAddServicio && isEditing && (
        <div className="mb-4 p-4 bg-[#F4F1EA] rounded-xl border border-[#E6D3A3]">
          <Select
            label="Servicio"
            value={newServicioId}
            onChange={(e) => setNewServicioId(e.target.value)}
            options={[
              { value: '', label: 'Seleccione un servicio' },
              ...serviciosCatalogo
                .filter(s => !servicios.some(ss => ss.servicio_id === s.id))
                .map(s => ({ value: String(s.id), label: s.nombre })),
            ]}
          />
          <Input
            label="Precio acordado (opcional)"
            type="number"
            value={newServicioPrecio}
            onChange={(e) => setNewServicioPrecio(e.target.value)}
            placeholder="Ej: 20000"
          />
          <div className="flex gap-2 mt-3">
            <Button type="button" onClick={handleAddServicio} size="sm" variant="primary" isLoading={addingServicio}>
              Añadir
            </Button>
            <Button type="button" onClick={() => setShowAddServicio(false)} size="sm" variant="ghost">
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {servicios.length === 0 ? (
        <p className="text-sm text-gray-400">Sin servicios registrados</p>
      ) : (
        <div className="space-y-2">
          {servicios.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-[#F4F1EA] rounded-lg">
              <div>
                <p className="font-medium text-[#231F20]">{s.nombre}</p>
                {s.precio_acordado && (
                  <p className="text-sm text-[#3b5630]">
                    ${Number(s.precio_acordado).toLocaleString('es-CO')} {s.unidad ? `/ ${s.unidad}` : ''}
                  </p>
                )}
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => handleDeleteServicio(s.id)}
                  className="text-[#E53935] hover:text-red-700 p-1"
                  title="Eliminar servicio"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
