'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/Input';
import { ArrowLeftIcon } from '../../../components/ui/Icons';

const ESTADOS_OPCIONES = [
  { value: '4', label: 'Activo' },
  { value: '5', label: 'Inactivo' },
];

export default function NuevoTerritorioPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [region, setRegion] = useState('');
  const [estado, setEstado] = useState('4');
  const [administrador, setAdministrador] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: backend endpoint no implementado aún
    alert('Funcionalidad de creación de territorio aún no disponible en el backend.');
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
          />

          <Input
            label="Región"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Ej: Zona Rural Palmira"
            required
          />

          <Select
            label="Estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            options={ESTADOS_OPCIONES}
          />

          <Input
            label="Administrador (ID del líder territorial)"
            type="number"
            value={administrador}
            onChange={(e) => setAdministrador(e.target.value)}
            placeholder="Ej: 1"
          />

          <div className="pt-2">
            <Button type="submit" size="md" variant="primary" className="w-full sm:w-auto">
              Crear Territorio
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
