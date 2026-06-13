/**
 * Formulario de revisión de solicitud
 * @celula - Celula1
 * Muestra el estado, el textarea de observaciones y los botones Aprobar/Rechazar.
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/base/Button';
import { Textarea } from '@/components/ui/base/Input';
import { SolicitudResultadoBadge } from '@/components/ui/aprobaractor/SolicitudResultadoBadge';
import { Solicitud } from '@/models/types';

const ESTADO_LABELS: Record<string, string> = {
  EN_REVISION: 'En Revisión',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
};

interface SolicitudReviewFormProps {
  solicitud: Solicitud;
  observaciones: string;
  onChangeObservaciones: (value: string) => void;
  onAprobar: () => void;
  onRechazar: () => void;
  saving: boolean;
  puedeAccionar: boolean;
}

export function SolicitudReviewForm({
  solicitud,
  observaciones,
  onChangeObservaciones,
  onAprobar,
  onRechazar,
  saving,
  puedeAccionar,
}: SolicitudReviewFormProps) {
  const estadoYaProcesado =
    solicitud.estado_resultado === 'APROBADO' || solicitud.estado_resultado === 'RECHAZADO';

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-[#E6D3A3] p-6">
      <h2 className="text-xl font-semibold text-[#231F20] mb-4">Revisión</h2>

      <div className="mb-4">
        <p className="text-sm text-[#353535]">Estado de la Solicitud</p>
        <p className="font-medium text-[#231F20] mt-1">
          {ESTADO_LABELS[solicitud.estado_resultado] || solicitud.estado_resultado}
        </p>
      </div>

      <Textarea
        label="Observaciones"
        value={observaciones}
        onChange={(e) => onChangeObservaciones(e.target.value)}
        placeholder="Escribe tus comentarios o razones para aprobar/rechazar la solicitud..."
        rows={4}
        disabled={estadoYaProcesado}
      />

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        {estadoYaProcesado ? (
          <SolicitudResultadoBadge estado={solicitud.estado_resultado} />
        ) : (
          <>
            <Button
              variant="outline"
              onClick={onAprobar}
              disabled={!puedeAccionar}
              isLoading={saving}
              className="bg-[#10b981] hover:bg-[#059669] text-white border-0 disabled:bg-gray-300 disabled:text-gray-500"
            >
              Aprobar
            </Button>
            <Button
              variant="outline"
              onClick={onRechazar}
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
  );
}
