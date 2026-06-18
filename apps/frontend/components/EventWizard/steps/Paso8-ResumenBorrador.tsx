// views/components/events/wizard/steps/Step8Review.tsx
'use client';
 
import React from 'react';
import { SUPPORTED_CURRENCIES } from '@/models/event.model';
import type { WizardFormData } from '@/hooks/events/useEventWizard';

interface Props {
  formData: WizardFormData;
}
 
// Componente de fila del resumen
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
 
export function Step8Review({ formData }: Props) {
  // Formatear fecha legible
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00')
      .toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  };
 
  // Formatear precio
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === formData.currency);
  const priceLabel = formData.pricingType === 'free'
    ? 'Gratuito'
    : `${currency?.symbol ?? ''} ${Number(formData.price).toLocaleString('es-CO')} ${formData.currency}`;
 
  // Fechas
  const startLabel = formatDate(formData.startDate);
  const endLabel   = formData.endDate ? ` → ${formatDate(formData.endDate)}` : '';
  const dateLabel  = startLabel + endLabel;
 
  const timeLabel  = formData.startTime
    ? `${formData.startTime}${formData.endTime ? ` – ${formData.endTime}` : ''}`
    : 'Sin hora definida';
 
  return (
    <div className="flex flex-col gap-4">
      {/* Imagen preview */}
      {formData.imagePreviewUrl && (
        <div className="rounded-xl overflow-hidden bg-[#f4ede0] aspect-video w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={formData.imagePreviewUrl}
            alt="Portada del evento"
            className="w-full h-full object-cover"
          />
        </div>
      )}
 
      {/* Datos del evento */}
      <div className="bg-[#f4ede0] rounded-xl px-4 py-2">
        <ReviewRow label="Nombre"      value={formData.name} />
        <ReviewRow label="Categoría"   value={formData.category} />
        <ReviewRow label="Fecha"       value={dateLabel} />
        <ReviewRow label="Hora"        value={timeLabel} />
        <ReviewRow label="Lugar"       value={formData.locationName} />
        {formData.locationAddress && (
          <ReviewRow label="Dirección" value={formData.locationAddress} />
        )}
        <ReviewRow label="Descripción" value={
          formData.description.length > 80
            ? formData.description.substring(0, 80) + '...'
            : formData.description
        } />
        <ReviewRow label="Precio"      value={priceLabel} />
        <ReviewRow label="Capacidad"   value={formData.capacity ? `${formData.capacity} personas` : ''} />
      </div>
 
      {/* Estado que tendrá el evento */}
      <div className="flex items-center justify-center gap-2 bg-[#f4ede0] rounded-xl py-3">
        <span className="text-xs text-[#6b7a63]">El evento se guardará como:</span>
        <span className="bg-white border border-[#c9d4be] text-[#557149] text-xs font-semibold px-3 py-1 rounded-full">
          Borrador
        </span>
      </div>
    </div>
  );
}