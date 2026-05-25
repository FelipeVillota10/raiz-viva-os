'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, adminService } from '../../services/api';
import { AdminTerritorio } from '../../models/types';

const ESTADO_COLORS: Record<string, string> = {
  'activo': 'bg-[#10b981]',
  'inactivo': 'bg-[#ef4444]',
  'en_revision': 'bg-[#0cc0df]',
  'rechazado': 'bg-[#E53935]',
  'aceptado': 'bg-[#3b5630]',
};

export default function TerritoriosPage() {
  const router = useRouter();
  const [territorios, setTerritorios] = useState<AdminTerritorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthAndFetch = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload['es_admin']) {
        router.push('/admin/login');
        return;
      }
    } catch {
      router.push('/admin/login');
      return;
    }

    try {
      const data = await adminService.getTerritorios();
      setTerritorios(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar territorios');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuthAndFetch();
  }, [checkAuthAndFetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[#353535]">Cargando territorios...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#557149] mb-2">Territorios</h1>
          <p className="text-[#353535]">Gestiona los territorios registrados en el sistema</p>
        </div>
        <button
          onClick={() => router.push('/admin/territorios/nuevo')}
          className="bg-[#3b5630] hover:bg-[#2d6530] text-white px-5 py-2.5 rounded-full text-sm font-medium transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Territorio
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#E53935]/10 border border-[#E53935] rounded-xl text-center">
          <p className="text-[#E53935] font-medium">{error}</p>
        </div>
      )}

      {territorios.length === 0 ? (
        <p className="text-center text-[#353535] py-12">No hay territorios registrados.</p>
      ) : (
        <div className="space-y-4">
          {territorios.map((territorio) => {
            const estadoBg = ESTADO_COLORS[territorio.estado_nombre?.toLowerCase()] || 'bg-gray-400';

            return (
              <div
                key={territorio.id_territorio}
                onClick={() => router.push(`/admin/territorios/${territorio.id_territorio}`)}
                className="bg-white rounded-2xl shadow-sm border-2 border-[#E6D3A3] hover:border-[#3b5630] hover:shadow-md transition-all duration-200 cursor-pointer p-5"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg text-[#231F20]">
                      {territorio.nombre_territorio}
                    </h3>
                    <p className="text-sm text-[#353535]">
                      {territorio.region}
                    </p>
                  </div>
                  <span className={`${estadoBg} text-white px-3 py-1 rounded-full text-xs font-bold capitalize`}>
                    {territorio.estado_nombre}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-[#353535]">Administrador:</span>
                  <span className="text-xs font-medium text-[#3b5630] bg-[#EFF7EA] px-2 py-1 rounded-full">
                    {territorio.administrador_nombre}
                  </span>
                </div>

                <div className="mt-2 text-xs text-gray-400">
                  ID: {territorio.id_territorio}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
