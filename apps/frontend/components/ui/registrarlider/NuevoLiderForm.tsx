/**
 * Formulario de nuevo líder territorial
 * @celula - Celula1
 * Componente de presentación que utiliza useNuevoLider como ViewModel.
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Select } from '@/components/ui/base/Input';
import { ArrowLeftIcon } from '@/components/ui/base/Icons';
import { useNuevoLider } from '@/hooks/useNuevoLider';

export function NuevoLiderForm() {
  const router = useRouter();
  const { territorios, loadingTerritorios, loading, error, fieldErrors, success, registrar } = useNuevoLider();
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [idTerritorio, setIdTerritorio] = useState('');
  const [activo, setActivo] = useState('true');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registrar({
      nombre_completo: nombreCompleto,
      email,
      password,
      confirmPassword,
      telefono,
      id_territorio: idTerritorio,
      activo,
    });
  };

  const territorioOptions = [
    { value: '', label: 'Sin territorio asignado' },
    ...territorios
      .filter((territorio) => !territorio.administrador_id)
      .map((territorio) => ({
        value: String(territorio.id_territorio),
        label: territorio.nombre_territorio,
      })),
  ];

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto w-full">
      <button
        type="button"
        onClick={() => router.push('/admin/lideres')}
        className="flex items-center gap-2 text-[#3b5630] hover:text-[#2d6530] font-medium mb-6 transition cursor-pointer"
      >
        <ArrowLeftIcon size={20} />
        Volver a Líderes
      </button>

      <h1 className="text-3xl font-bold text-[#3b5630] mb-2">Nuevo Líder Territorial</h1>
      <p className="text-[#353535] mb-6">Registra la cuenta del líder y asígnale un territorio.</p>

      {error && (
        <div className="mb-5 p-4 bg-[#E53935]/10 border border-[#E53935] rounded-xl text-center">
          <p className="text-[#E53935] font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-5 p-4 bg-[#3b5630]/10 border border-[#3b5630] rounded-xl text-center">
          <p className="text-[#3b5630] font-semibold">{success}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border-2 border-[#E6D3A3] p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nombre completo"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            placeholder="Ej: Ana María Rivera"
            required
            error={fieldErrors.nombre_completo?.[0]}
          />

          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="lider@raizviva.com"
            required
            error={fieldErrors.email?.[0]}
          />

          <Input
            label="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej: 3001234567"
            required
            error={fieldErrors.telefono?.[0]}
          />

          <Select
            label="Territorio"
            value={idTerritorio}
            onChange={(e) => setIdTerritorio(e.target.value)}
            options={territorioOptions}
            disabled={loadingTerritorios}
            error={fieldErrors.id_territorio?.[0]}
          />

          <Select
            label="Estado"
            value={activo}
            onChange={(e) => setActivo(e.target.value)}
            options={[
              { value: 'true', label: 'Activo' },
              { value: 'false', label: 'Inactivo' },
            ]}
            error={fieldErrors.activo?.[0]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              error={fieldErrors.password?.[0]}
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              required
              error={fieldErrors.password?.[0]}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3b5630] px-5 py-2.5 text-base font-semibold text-white transition hover:bg-[#2d6530] disabled:cursor-not-allowed disabled:bg-[#8c9a80]"
            >
              {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              Registrar Líder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
