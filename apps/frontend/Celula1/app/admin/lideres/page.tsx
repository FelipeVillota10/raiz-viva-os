'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, adminService } from '../../services/api';
import { AdminLider } from '../../models/types';

export default function LideresPage() {
  const router = useRouter();
  const [lideres, setLideres] = useState<AdminLider[]>([]);
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
      const data = await adminService.getLideres();
      setLideres(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar lideres');
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
        <p className="text-[#353535]">Cargando lideres...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#557149] mb-2">Líderes</h1>
          <p className="text-[#353535]">Gestiona los líderes territoriales registrados en el sistema</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#E53935]/10 border border-[#E53935] rounded-xl text-center">
          <p className="text-[#E53935] font-medium">{error}</p>
        </div>
      )}

      {lideres.length === 0 ? (
        <p className="text-center text-[#353535] py-12">No hay líderes registrados.</p>
      ) : (
        <div className="space-y-4">
          {lideres.map((lider) => (
            <div
              key={lider.id_cliente}
              onClick={() => router.push(`/admin/lideres/${lider.id_cliente}`)}
              className="bg-white rounded-2xl shadow-sm border-2 border-[#E6D3A3] hover:border-[#3b5630] hover:shadow-md transition-all duration-200 cursor-pointer p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#3b5630] flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {lider.nombre.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-[#231F20] truncate">
                        {lider.nombre}
                      </h3>
                      <p className="text-sm text-[#353535]">{lider.usuario_email}</p>
                    </div>
                    <span className={`shrink-0 text-white px-3 py-1 rounded-full text-xs font-bold ${
                      lider.activo ? 'bg-[#10b981]' : 'bg-[#ef4444]'
                    }`}>
                      {lider.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
                    {lider.telefono && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[#353535]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span className="text-xs text-[#353535]">{lider.telefono}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#353535]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="text-xs text-[#353535]">{lider.territorio_nombre || 'Sin territorio'}</span>
                    </div>
                  </div>
                </div>

                <svg className="w-5 h-5 text-[#3b5630] shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
