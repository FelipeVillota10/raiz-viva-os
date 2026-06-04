// views/components/events/EventCard.tsx
'use client';
 
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/app/views/components/shared/StatusBadge';
import { DeactivateConfirmModal } from '@/app/views/components/events/DeactivateConfirmModal';
import type { EventListItem } from '@/app/viewmodels/events/useEventList';
 
interface Props {
  event:      EventListItem;
  onDeactivate: (id: string) => Promise<void>;
}
 
export function EventCard({ event, onDeactivate }: Props) {
  const router = useRouter();
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [isLoading,      setIsLoading]      = useState(false);
 
  const canEdit       = event.status !== 'active' && event.status !== 'inactive';
  const canDeactivate = event.status === 'draft' || event.status === 'pending';
 
  const priceLabel = event.pricingType === 'free'
    ? 'Gratuito'
    : `${event.currency} ${event.price.toLocaleString('es-CO')}`;
 
  async function handleDeactivate() {
    setIsLoading(true);
    await onDeactivate(event.id);
    setIsLoading(false);
    setShowDeactivate(false);
  }
 
  return (
    <>
      <div className="bg-white rounded-xl border border-[#c9d4be] px-4 py-3 flex flex-col gap-2 hover:shadow-sm transition-shadow">
        {/* Fila superior: nombre + estado */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-[#2c3a26] leading-snug flex-1">
            {event.name}
          </p>
          <StatusBadge status={event.status} />
        </div>
 
        {/* Descripcion */}
        <p className="text-xs text-[#6b7a63] line-clamp-2">
          {event.description}
        </p>
 
        {/* Pills de info */}
        <div className="flex flex-wrap gap-1.5">
          <span className="bg-[#f4ede0] text-[#557149] text-[10px] font-medium px-2 py-0.5 rounded-full">
            {event.category}
          </span>
          <span className="bg-[#f4ede0] text-[#557149] text-[10px] font-medium px-2 py-0.5 rounded-full">
            {priceLabel}
          </span>
          <span className="bg-[#f4ede0] text-[#6b7a63] text-[10px] px-2 py-0.5 rounded-full">
            {event.capacity} personas
          </span>
          <span className="bg-[#f4ede0] text-[#6b7a63] text-[10px] px-2 py-0.5 rounded-full">
            {new Date(event.startDate + 'T00:00:00').toLocaleDateString('es-CO', {
              day: '2-digit', month: 'short', year: 'numeric'
            })}
          </span>
        </div>
 
        {/* Acciones */}
        <div className="flex gap-2 pt-1">
          {canEdit && (
            <button
              onClick={() => router.push(`/actor/events/${event.id}/edit`)}
              className="flex-1 text-xs bg-[#557149] hover:bg-[#3b5630] text-white py-1.5 rounded-lg font-medium transition-colors"
            >
              Editar
            </button>
          )}
          {canDeactivate && (
            <button
              onClick={() => setShowDeactivate(true)}
              className="flex-1 text-xs border border-red-300 text-red-500 hover:bg-red-50 py-1.5 rounded-lg font-medium transition-colors"
            >
              Inactivar
            </button>
          )}
          {!canEdit && !canDeactivate && (
            <span className="text-[10px] text-[#9eaa94] italic">
              Sin acciones disponibles
            </span>
          )}
        </div>
      </div>
 
      <DeactivateConfirmModal
        visible={showDeactivate}
        eventName={event.name}
        onConfirm={handleDeactivate}
        onClose={() => setShowDeactivate(false)}
        isLoading={isLoading}
      />
    </>
  );
}
 