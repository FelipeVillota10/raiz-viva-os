'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeaderLider } from '../../components/HeaderLider';
import { Footer } from '../../components/Footer';
import { getToken } from '../../lib/auth';
import { API_URL } from '../../lib/auth';

interface Solicitud {
  id: number;
  estado_resultado: string;
  observaciones: string;
  fecha_solicitud: string;
  fecha_respuesta: string | null;
  actor_info: {
    id: number;
    nombre_completo: string;
    telefono: string;
    servicio: string;
    territorio_nombre: string | null;
    tipos_actores: { id: number; nombre_tipo: string }[];
  };
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  EN_REVISION: { label: 'En Revisión', color: 'text-white', bg: 'bg-[#0cc0df]' },
  APROBADO: { label: 'Aprobado', color: 'text-white', bg: 'bg-[#10b981]' },
  RECHAZADO: { label: 'Rechazado', color: 'text-white', bg: 'bg-[#ef4444]' },
};

export default function AprobacionesPage() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<string>('');

  useEffect(() => {
    const fetchSolicitudes = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const url = filtro ? `${API_URL}/api/solicitudes/?estado=${filtro}` : `${API_URL}/api/solicitudes/`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setSolicitudes(data);
        }
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, [filtro]);

  const pendingCount = solicitudes.filter(s => s.estado_resultado === 'EN_REVISION').length;

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f3e7]">
      <HeaderLider showNotification pendingCount={pendingCount} />

      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-[#557149] mb-2">Solicitudes de Registro</h1>
        <p className="text-[#353535] mb-6">Revisa y gestiona las solicitudes de actores territoriales en tu territorio</p>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['', 'EN_REVISION', 'APROBADO', 'RECHAZADO'].map(estado => (
            <button
              key={estado}
              onClick={() => setFiltro(estado)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                filtro === estado
                  ? 'bg-[#3b5630] text-white'
                  : 'bg-white text-[#353535] border border-[#8c9a80] hover:bg-[#EFF7EA]'
              }`}
            >
              {estado === '' ? 'Todas' : ESTADO_CONFIG[estado]?.label || estado}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-[#353535] py-12">Cargando solicitudes...</p>
        ) : solicitudes.length === 0 ? (
          <p className="text-center text-[#353535] py-12">No hay solicitudes para mostrar.</p>
        ) : (
          <div className="space-y-4">
            {solicitudes.map(solicitud => {
              const estado = ESTADO_CONFIG[solicitud.estado_resultado] || ESTADO_CONFIG['EN_REVISION'];
              const primerTipo = solicitud.actor_info.tipos_actores[0];

              return (
                <div
                  key={solicitud.id}
                  onClick={() => router.push(`/lider/aprobaciones/${solicitud.id}`)}
                  className="bg-white rounded-2xl shadow-sm border-2 border-[#E6D3A3] hover:border-[#3b5630] hover:shadow-md transition-all duration-200 cursor-pointer p-5"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-[#231F20]">
                        {solicitud.actor_info.nombre_completo}
                      </h3>
                      <p className="text-sm text-[#353535]">
                        {solicitud.actor_info.telefono} · {solicitud.actor_info.territorio_nombre || 'Sin territorio'}
                      </p>
                    </div>
                    <span className={`${estado.bg} ${estado.color} px-3 py-1 rounded-full text-xs font-bold`}>
                      {estado.label}
                    </span>
                  </div>

                  <p className="text-sm text-[#353535] mb-2">
                    <span className="font-medium">Solicita aprobación para:</span> {solicitud.actor_info.servicio || 'Sin descripción'}
                  </p>

                  {primerTipo && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-[#3b5630] bg-[#EFF7EA] px-2 py-1 rounded-full capitalize">
                        {primerTipo.nombre_tipo}
                      </span>
                      {solicitud.actor_info.tipos_actores.length > 1 && (
                        <span className="text-xs text-[#353535]">
                          +{solicitud.actor_info.tipos_actores.length - 1} más
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-400">
                    Solicitado el {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-CO', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}