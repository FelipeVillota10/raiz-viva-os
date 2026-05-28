'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/Input';
import { ArrowLeftIcon } from '../../../components/ui/Icons';
import { AdminLider } from '../../../models/types';
import { adminService } from '../../../services/api';

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
  const [lideresDisponibles, setLideresDisponibles] = useState<{ value: string; label: string }[]>([]);
  const [loadingLideres, setLoadingLideres] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLideres = async () => {
      try {
        const lideres = await adminService.getLideresDisponibles();
        setLideresDisponibles([
          { value: '', label: 'Seleccione un líder' },
          ...lideres.map((l: AdminLider) => ({
            value: String(l.id_cliente),
            label: `${l.nombre} (${l.usuario_email})`,
          })),
        ]);
      } catch {
        setError('Error al cargar líderes disponibles');
      } finally {
        setLoadingLideres(false);
      }
    };
    fetchLideres();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!administrador) {
      setError('Debe seleccionar un líder para el territorio');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.crearTerritorio({
        nombre_territorio: nombre.trim(),
        region: region.trim(),
        id_administrador: parseInt(administrador),
      });
      router.push('/admin/territorios');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear territorio');
    } finally {
      setIsSubmitting(false);
    }
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

          <Select
            label="Administrador (Líder del territorio)"
            value={administrador}
            onChange={(e) => setAdministrador(e.target.value)}
            options={loadingLideres
              ? [{ value: '', label: 'Cargando líderes...' }]
              : lideresDisponibles
            }
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
