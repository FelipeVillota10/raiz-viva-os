'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/shared/Button';
import { useMonedas } from '@/hooks/shared/useMonedas';
import { useCategoriasViewModel } from '@/hooks/events/useCategoriasViewModel';
import { useTerritorios } from '@/hooks/shared/useTerritorios';
import { eventosService, type EventDataPayload } from '@/services/eventosService';

interface Props {
  visible: boolean;
  onClose: () => void;
  data?: EventDataPayload | null;
  eventId?: string;
  onConfirm?: () => Promise<void>;
  confirmText?: string;
  isLoading?: boolean;
}

// Fila de información del resumen
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-[#c9d4be] last:border-0">
      <span className="text-xs text-[#6b7a63] w-24 shrink-0">{label}</span>
      <span className="text-sm text-[#2c3a26] font-medium text-right flex-1 ml-2 break-word">
        {value || '—'}
      </span>
    </div>
  );
}

export function EventSummaryModal({
  visible,
  onClose,
  data: initialData,
  eventId,
  onConfirm,
  confirmText = 'Confirmar',
  isLoading = false,
}: Props) {
  const { monedas } = useMonedas();
  const { categorias } = useCategoriasViewModel();
  const { territorios } = useTerritorios();
  
  const [data, setData] = useState<EventDataPayload | null>(initialData || null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && !initialData && eventId) {
      setIsFetching(true);
      setError(null);
      eventosService.obtenerEvento(eventId)
        .then(res => setData(res))
        .catch(err => setError(err.message))
        .finally(() => setIsFetching(false));
    } else if (visible && initialData) {
      setData(initialData);
    }
  }, [visible, initialData, eventId]);

  // Formatear fecha legible
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00')
      .toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const currency = data ? monedas.find(c => c.id === Number(data.currency)) : null;
  const priceLabel = data?.pricingType === 'free'
    ? 'Gratuito'
    : data?.price ? `${currency?.simbolo ?? ''} ${Number(data.price).toLocaleString('es-CO')}` : '—';

  const startLabel = formatDate(data?.startDate);
  const endLabel   = data?.endDate ? ` → ${formatDate(data.endDate)}` : '';
  const dateLabel  = startLabel + endLabel;

  const timeLabel  = data?.startTime
    ? `${data.startTime}${data.endTime ? ` – ${data.endTime}` : ''}`
    : 'Sin hora definida';

  const categoryName = data?.category 
    ? categorias.find(c => c.id.toString() === data.category.toString())?.nombre || data.category
    : '—';

  const territoryName = data?.locationId
    ? territorios.find(t => t.id_territorio.toString() === data.locationId.toString())?.nombre_territorio || data.locationId
    : '—';

  return (
    <Modal
      visible={visible}
      title="Resumen del Evento"
      onClose={onClose}
      footer={
        <>
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isLoading || isFetching}
            className="flex-1"
          >
            {onConfirm ? 'Cancelar' : 'Cerrar'}
          </Button>
          {onConfirm && (
            <Button
              variant="primary"
              size="md"
              isLoading={isLoading}
              onClick={onConfirm}
              className="flex-1"
              disabled={isFetching || !!error}
            >
              {confirmText}
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {isFetching && <p className="text-sm text-center text-[#6b7a63]">Cargando detalles...</p>}
        {error && <p className="text-sm text-center text-red-500">Error: {error}</p>}
        
        {!isFetching && !error && data && (
          <>
            {/* Imagen preview */}
            {data.imagePreviewUrl && (
              <div className="rounded-xl overflow-hidden bg-[#f4ede0] aspect-video w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.imagePreviewUrl}
                  alt="Portada del evento"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Datos del evento */}
            <div className="bg-[#f4ede0] rounded-xl px-4 py-2">
              <ReviewRow label="Nombre"      value={data.name} />
              <ReviewRow label="Categoría"   value={String(categoryName)} />
              <ReviewRow label="Fecha"       value={dateLabel} />
              <ReviewRow label="Hora"        value={timeLabel} />
              <ReviewRow label="Lugar"       value={String(territoryName)} />
              <ReviewRow label="Descripción" value={
                data.description.length > 80
                  ? data.description.substring(0, 80) + '...'
                  : data.description
              } />
              <ReviewRow label="Precio"      value={priceLabel} />
              <ReviewRow label="Capacidad"   value={data.capacity ? `${data.capacity} personas` : ''} />
            </div>

            {onConfirm && (
              <div className="flex items-center justify-center gap-2 bg-[#f4ede0] rounded-xl py-3 mt-2">
                <span className="text-xs text-[#6b7a63]">Este evento se guardará. Revisa la información.</span>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
