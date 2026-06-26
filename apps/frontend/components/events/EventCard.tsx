// views/components/events/EventCard.tsx
'use client';
 
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DeactivateConfirmModal } from '@/components/events/DeactivateConfirmModal';
import { EventSummaryModal } from '@/components/events/EventSummaryModal';
import { PublishConfirmModal } from '@/components/events/PublishConfirmModal';
import { DistributionModal } from '@/components/events/DistributionModal';
import type { EventListItem } from '@/hooks/events/useEventListViewModel';
 
interface Props {
  event:      EventListItem;
  onDeactivate: (id: string) => Promise<void>;
  onCancelSubmit?: (id: string) => Promise<void>;
  onSubmitEvent?: (id: string) => Promise<void>;
  onActivate?: (id: string) => Promise<void>;
}
 
export function EventCard({ event, onDeactivate, onCancelSubmit, onSubmitEvent, onActivate }: Props) {
  const router = useRouter();
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showDistribution, setShowDistribution] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isLoading,      setIsLoading]      = useState(false);
  const [isCanceling,    setIsCanceling]    = useState(false);
  const [isSubmitting,   setIsSubmitting]   = useState(false);
 
  const s = (event.status || '').toLowerCase();
  const isInactive = s.includes('inactivo') || s.includes('inactive');
  const isEnRevision = s.includes('revisión') || s.includes('revision');
  const isAprobado = s.includes('aprobado');
  const isPublicado = s.includes('publicado');
  const isActivo = s.includes('activo') && !isInactive;
  const isBorrador = s.includes('borrador') || s.includes('draft');
  
  const canEdit       = !isInactive && !isEnRevision && !isAprobado && !isActivo && !isPublicado;
  const canDeactivate = !isInactive && !isEnRevision && !isActivo && !isPublicado;
 
  const priceLabel = event.pricingType === 'free'
    ? 'Gratuito'
    : `${event.currency} ${event.price.toLocaleString('es-CO')}`;
 
  async function handleDeactivate() {
    setIsLoading(true);
    await onDeactivate(event.id);
    setIsLoading(false);
    setShowDeactivate(false);
  }

  async function handleCancelSubmit() {
    if (!onCancelSubmit) return;
    setIsCanceling(true);
    await onCancelSubmit(event.id);
    setIsCanceling(false);
  }

  async function handleSubmitEvent() {
    if (!onSubmitEvent) return;
    setIsSubmitting(true);
    await onSubmitEvent(event.id);
    setIsSubmitting(false);
  }

  async function handleActivate() {
    if (!onActivate) return;
    await onActivate(event.id);
  }
 
  return (
    <>
      <div 
        onClick={() => setShowSummary(true)}
        className="bg-white rounded-xl border border-[#c9d4be] p-4 flex flex-col md:flex-row gap-4 hover:shadow-sm hover:border-[#8c9a80] transition-colors cursor-pointer"
      >
        {event.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={event.image} 
            alt={event.name} 
            className="w-full md:w-32 h-32 md:h-24 object-cover rounded-lg shrink-0 bg-[#f4ede0]"
          />
        ) : (
          <div className="w-full md:w-32 h-32 md:h-24 bg-[#f4ede0] rounded-lg shrink-0 flex items-center justify-center text-[#6b7a63] text-xs text-center p-2">
            Sin imagen
          </div>
        )}

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-[#2c3a26] leading-snug flex-1">
                {event.name}
              </p>
              <StatusBadge status={event.status} />
            </div>
    
            {/* Descripcion */}
            <p className="text-xs text-[#6b7a63] line-clamp-2 mt-1">
              {event.description}
            </p>
          </div>
  
          {/* Pills de info */}
          <div className="flex flex-wrap gap-1.5 mt-3">
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
            {(() => {
              try {
                const d = new Date(event.startDate);
                if (isNaN(d.getTime())) return 'Fecha no definida';
                return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
              } catch {
                return 'Fecha inválida';
              }
            })()}
          </span>
        </div>
 
        {/* Acciones */}
        <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
          {isBorrador && (
            <button
              disabled={isSubmitting}
              onClick={handleSubmitEvent}
              className="flex-1 text-xs bg-[#557149] hover:bg-[#3b5630] text-white py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '...' : 'Solicitar'}
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => router.push(`/actor/events/${event.id}/edit`)}
              className="flex-1 text-xs border border-[#557149] text-[#557149] hover:bg-[#f4ede0] py-1.5 rounded-lg font-medium transition-colors"
            >
              Editar
            </button>
          )}
          
          {isEnRevision && (
            <button
              disabled={isCanceling}
              onClick={handleCancelSubmit}
              className="flex-1 text-xs border border-[#8c9a80] text-[#557149] hover:bg-[#f4ede0] py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isCanceling ? '...' : 'Cancelar Envío'}
            </button>
          )}

          {isAprobado && (
            <>
              <button
                onClick={() => router.push(`/actor/events/${event.id}/colaborar`)}
                className="flex-1 text-xs border border-[#8c9a80] text-[#557149] hover:bg-[#f4ede0] py-1.5 rounded-lg font-medium transition-colors"
              >
                Colaborar
              </button>
              <button
                onClick={() => setShowPublish(true)}
                className="flex-1 text-xs bg-[#557149] hover:bg-[#3b5630] text-white py-1.5 rounded-lg font-medium transition-colors"
              >
                Publicar
              </button>
            </>
          )}

          {canDeactivate && (
            <button
              onClick={() => setShowDeactivate(true)}
              className="flex-1 text-xs border border-red-300 text-red-500 hover:bg-red-50 py-1.5 rounded-lg font-medium transition-colors"
            >
              Inactivar
            </button>
          )}

          { (isActivo || isPublicado) && (
            <button
              onClick={() => setShowDistribution(true)}
              className="flex-1 text-xs border border-[#8c9a80] text-[#557149] hover:bg-[#f4ede0] py-1.5 rounded-lg font-medium transition-colors"
            >
              Distribución de pago
            </button>
          )}

          {!canEdit && !canDeactivate && !isEnRevision && !isAprobado && !isBorrador && !isActivo && !isPublicado && (
            <span className="text-[10px] text-[#9eaa94] italic flex-1 flex items-center">
              Sin acciones disponibles
            </span>
          )}
        </div>
        </div>
      </div>
 
      <DeactivateConfirmModal
        visible={showDeactivate}
        eventName={event.name}
        onConfirm={handleDeactivate}
        onClose={() => setShowDeactivate(false)}
        isLoading={isLoading}
      />

      <PublishConfirmModal
        visible={showPublish}
        event={event}
        onConfirm={handleActivate}
        onClose={() => setShowPublish(false)}
      />

      <DistributionModal
        visible={showDistribution}
        eventId={event.id}
        eventName={event.name}
        onClose={() => setShowDistribution(false)}
      />

      <EventSummaryModal
        visible={showSummary}
        onClose={() => setShowSummary(false)}
        eventId={event.id}
      />
    </>
  )
}
