'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/Button';
import { Input, Textarea } from '../../../components/ui/Input';
import { getToken } from '../../../lib/auth';
import { API_URL } from '../../../lib/auth';
import { ArrowLeftIcon } from '../../../components/ui/Icons';
import { useAprobaciones } from '../../../hooks/useAprobaciones';

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
    usuario_email: string;
    tipos_actores: { id: number; nombre_tipo: string }[];
  };
}

const ESTADO_LABELS: Record<string, string> = {
  EN_REVISION: 'En Revisión',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
};

export default function SolicitudDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { refresh } = useAprobaciones();
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchSolicitud = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/solicitudes/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setSolicitud(data);
          setObservaciones(data.observaciones || '');
        }
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitud();
  }, [id]);

  const estadoYaProcesado = solicitud?.estado_resultado === 'APROBADO' || solicitud?.estado_resultado === 'RECHAZADO';

  const puedeAccionar = estadoYaProcesado ? false : !!observaciones.trim();
  const tiposActores = solicitud?.actor_info.tipos_actores || [];

  const handleActualizar = async (estado: string) => {
    setSaving(true);
    const token = getToken();
    try {
      const response = await fetch(`${API_URL}/api/solicitudes/${id}/actualizar/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado_resultado: estado, observaciones }),
      });
      if (response.ok) {
        const data = await response.json();
        setSolicitud(data);
        setToast(`Solicitud ${estado === 'APROBADO' ? 'aprobada' : 'rechazada'} correctamente`);
        refresh();
        setTimeout(() => setToast(null), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto w-full">
      <button
        onClick={() => router.push('/lider/aprobaciones')}
        className="flex items-center gap-2 text-[#3b5630] hover:text-[#2d6530] font-medium mb-6 transition cursor-pointer"
      >
        <ArrowLeftIcon size={20} />
        Volver a Solicitudes
      </button>

      {toast && (
        <div className="mb-4 p-4 bg-[#10b981] text-white rounded-xl text-center font-medium">
          {toast}
        </div>
      )}

      {loading ? (
        <p className="text-center text-[#353535] py-12">Cargando...</p>
      ) : solicitud ? (
        <>
          <h1 className="text-3xl font-bold text-[#557149] mb-6">Detalle de Solicitud</h1>

          <div className="bg-white rounded-2xl shadow-sm border-2 border-[#E6D3A3] p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#231F20] mb-4">Información del Solicitante</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#353535]">Nombre completo</p>
                <p className="font-medium text-[#231F20]">{solicitud.actor_info.nombre_completo}</p>
              </div>
              <div>
                <p className="text-sm text-[#353535]">Correo electrónico</p>
                <p className="font-medium text-[#231F20]">{solicitud.actor_info.usuario_email}</p>
              </div>
              <div>
                <p className="text-sm text-[#353535]">Teléfono</p>
                <p className="font-medium text-[#231F20]">{solicitud.actor_info.telefono}</p>
              </div>
              <div>
                <p className="text-sm text-[#353535]">Territorio</p>
                <p className="font-medium text-[#231F20]">{solicitud.actor_info.territorio_nombre || 'No asignado'}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-[#353535]">Servicio / Descripción</p>
              <p className="font-medium text-[#231F20]">{solicitud.actor_info.servicio || 'Sin descripción'}</p>
            </div>

            <div className="mt-4">
              <p className="text-sm text-[#353535] mb-2">Tipos de Actor</p>
              <div className="flex gap-2 flex-wrap">
                {tiposActores.map(tipo => (
                  <span key={tipo.id} className="bg-[#EFF7EA] text-[#3b5630] px-3 py-1 rounded-full text-sm font-medium capitalize">
                    {tipo.nombre_tipo}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border-2 border-[#E6D3A3] p-6">
            <h2 className="text-xl font-semibold text-[#231F20] mb-4">Revisión</h2>

            <div className="mb-4">
              <p className="text-sm text-[#353535]">Estado de la Solicitud</p>
              <p className="font-medium text-[#231F20] mt-1">{ESTADO_LABELS[solicitud.estado_resultado] || solicitud.estado_resultado}</p>
            </div>

            <Textarea
              label="Observaciones"
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              placeholder="Escribe tus comentarios o razones para aprobar/rechazar la solicitud..."
              rows={4}
              disabled={estadoYaProcesado}
            />

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {estadoYaProcesado ? (
                <>
                  {solicitud.estado_resultado === 'APROBADO' ? (
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#10b981] text-white rounded-full text-sm font-medium">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Aprobado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-full text-sm font-medium">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      Rechazado
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleActualizar('APROBADO')}
                    disabled={!puedeAccionar}
                    isLoading={saving}
                    className="bg-[#10b981] hover:bg-[#059669] text-white border-0 disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleActualizar('RECHAZADO')}
                    disabled={!puedeAccionar}
                    isLoading={saving}
                    className="bg-[#ef4444] hover:bg-[#dc2626] text-white border-0 disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    Rechazar
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-[#353535] py-12">Solicitud no encontrada.</p>
      )}
    </div>
  );
}