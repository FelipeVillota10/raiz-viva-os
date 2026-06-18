/**
 * Página de detalle de solicitud (View)
 * @celula - Celula1
 * Vista que utiliza useSolicitudes como ViewModel.
 */

'use client';

import { useEffect, useState, use } from 'react';
import { useSolicitudes } from '@/hooks/useSolicitudes';
import { SolicitudDetalleHeader } from '@/components/ui/aprobaractor/SolicitudDetalleHeader';
import { SolicitudSolicitanteCard } from '@/components/ui/aprobaractor/SolicitudSolicitanteCard';
import { SolicitudReviewForm } from '@/components/ui/aprobaractor/SolicitudReviewForm';
import { LoadingState } from '@/components/ui/base/LoadingState';

export default function SolicitudDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    solicitud,
    loading,
    saving,
    toast,
    error,
    fetchSolicitud,
    actualizarSolicitud,
  } = useSolicitudes();

  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    fetchSolicitud(Number(id));
  }, [id, fetchSolicitud]);

  useEffect(() => {
    if (solicitud) {
      setObservaciones(solicitud.observaciones || '');
    }
  }, [solicitud]);

  const puedeAccionar = !!observaciones.trim();
  const handleBack = () => {
    window.location.href = '/lider/aprobaciones';
  };

  const handleActualizar = async (estado: string) => {
    try {
      await actualizarSolicitud(Number(id), estado, observaciones);
    } catch {
      // error ya manejado en el hook
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-8 max-w-3xl mx-auto w-full">
        <LoadingState message="Cargando..." />
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="px-4 py-8 max-w-3xl mx-auto w-full">
        <SolicitudDetalleHeader onBack={handleBack} toast={toast} error={error} />
        <p className="text-center text-[#353535] py-12">Solicitud no encontrada.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto w-full">
      <SolicitudDetalleHeader onBack={handleBack} toast={toast} error={error} />

      <h1 className="text-3xl font-bold text-[#557149] mb-6">Detalle de Solicitud</h1>

      <SolicitudSolicitanteCard solicitud={solicitud} />

      <SolicitudReviewForm
        solicitud={solicitud}
        observaciones={observaciones}
        onChangeObservaciones={setObservaciones}
        onAprobar={() => handleActualizar('APROBADO')}
        onRechazar={() => handleActualizar('RECHAZADO')}
        saving={saving}
        puedeAccionar={puedeAccionar}
      />
    </div>
  );
}
