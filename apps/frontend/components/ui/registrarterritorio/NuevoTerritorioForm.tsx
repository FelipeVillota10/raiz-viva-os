/**
 * Formulario de nuevo territorio
 * @celula - Celula1
 * Componente de presentación que utiliza useNuevoTerritorio como ViewModel.
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/base/Button';
import { Input, Select } from '@/components/ui/base/Input';
import { ArrowLeftIcon } from '@/components/ui/base/Icons';
import { useNuevoTerritorio } from '@/hooks/useNuevoTerritorio';

const ESTADOS_OPCIONES = [
  { value: '4', label: 'Activo' },
  { value: '5', label: 'Inactivo' },
];

export function NuevoTerritorioForm() {
  const router = useRouter();
  const { lideresDisponibles, loadingLideres, isSubmitting, error, fieldErrors, crear } = useNuevoTerritorio();
  const [nombre, setNombre] = useState('');
  const [region, setRegion] = useState('');
  const [estado, setEstado] = useState('4');
  const [administrador, setAdministrador] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await crear({ nombre, region, administrador });
  };

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto w-full">
      <button
        onClick={() => router.push('/admin/territorios')}
        className="flex items-center gap-2 text-[#3b5630] hover:text-[#2d6530] font-medium mb-6 transition cursor-pointer"
      >
        <ArrowLeftIcon size={20} />
        Volver a Territorios
      </button>

      <h1 className="text-3xl font-bold text-[#557149] mb-2">Nuevo Territorio</h1>
      <p className="text-[#353535] mb-6">Completa la información para registrar un nuevo territorio</p>

      <div className="bg-white rounded-2xl shadow-sm border-2 border-[#E6D3A3] p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nombre del Territorio"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Buitrera"
            required
            error={fieldErrors.nombre_territorio?.[0]}
          />

          <Input
            label="Región"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Ej: Zona Rural Palmira"
            required
            error={fieldErrors.region?.[0]}
          />

          <Select
            label="Estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            options={ESTADOS_OPCIONES}
          />

          <Select
            label="Administrador (Líder del territorio)"
            value={administrador}
            onChange={(e) => setAdministrador(e.target.value)}
            options={loadingLideres
              ? [{ value: '', label: 'Cargando líderes...' }]
              : lideresDisponibles
            }
            error={fieldErrors.id_administrador?.[0]}
          />

          {error && (
            <div className="p-4 bg-[#E53935]/10 border border-[#E53935] rounded-xl text-center">
              <p className="text-[#E53935] font-medium">{error}</p>
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" size="md" variant="primary" className="w-full sm:w-auto" isLoading={isSubmitting}>
              Crear Territorio
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
