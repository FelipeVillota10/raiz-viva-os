'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Select } from '../../../components/ui/Input';
import { ArrowLeftIcon } from '../../../components/ui/Icons';
import { AdminTerritorio } from '../../../models/types';
import { getToken } from '../../../services/api';

const API_URL = 'http://localhost:8000';

type BackendErrors = Record<string, string | string[]>;
type BackendErrorResponse = {
  error?: string;
  detail?: string;
  errores?: BackendErrors;
};

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

function getBackendError(errorData: BackendErrorResponse) {
  if (errorData?.error) return errorData.error;
  if (errorData?.detail) return errorData.detail;
  if (errorData?.errores) {
    const firstKey = Object.keys(errorData.errores)[0];
    const firstError = errorData.errores[firstKey];
    if (Array.isArray(firstError)) return firstError[0];
    if (typeof firstError === 'string') return firstError;
    return 'Revisa los datos ingresados.';
  }
  return 'No se pudo registrar el líder.';
}

export default function NuevoLiderPage() {
  const router = useRouter();
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [idTerritorio, setIdTerritorio] = useState('');
  const [activo, setActivo] = useState('true');
  const [territorios, setTerritorios] = useState<AdminTerritorio[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTerritorios, setLoadingTerritorios] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchTerritorios = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/territorios/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => []);
        if (!response.ok) {
          throw new Error(getBackendError(data));
        }
        setTerritorios(data);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Error al cargar territorios.'));
      } finally {
        setLoadingTerritorios(false);
      }
    };

    fetchTerritorios();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('La contraseña y la confirmación no coinciden.');
      return;
    }

    const token = getToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/usuarios/admin/registrar-lider/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre_completo: nombreCompleto.trim(),
          email: email.trim(),
          password,
          telefono: telefono.trim(),
          id_territorio: idTerritorio ? Number(idTerritorio) : null,
          activo: activo === 'true',
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(getBackendError(data));
      }

      setSuccess('Líder territorial registrado correctamente.');
      setTimeout(() => router.push('/admin/lideres'), 1200);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'No se pudo registrar el líder.'));
    } finally {
      setLoading(false);
    }
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
          />

          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="lider@raizviva.com"
            required
          />

          <Input
            label="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej: 3001234567"
            required
          />

          <Select
            label="Territorio"
            value={idTerritorio}
            onChange={(e) => setIdTerritorio(e.target.value)}
            options={territorioOptions}
            disabled={loadingTerritorios}
          />

          <Select
            label="Estado"
            value={activo}
            onChange={(e) => setActivo(e.target.value)}
            options={[
              { value: 'true', label: 'Activo' },
              { value: 'false', label: 'Inactivo' },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              required
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
