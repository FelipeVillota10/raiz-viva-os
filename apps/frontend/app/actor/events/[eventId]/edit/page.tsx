// app/actor/events/[eventId]/edit/page.tsx
'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActorDashboardLayout } from '@/components/layouts/ActorDashboardLayout';
import { EventForm } from '@/components/events/EventForm';
import { eventosService, type EventDataPayload } from '@/services/eventosService';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  params: Promise<{ eventId: string }>;
}

export default function EditEventPage({ params }: Props) {
  const { eventId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  
  const [initialData, setInitialData] = useState<EventDataPayload | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    eventosService.obtenerEvento(eventId)
      .then(data => setInitialData(data))
      .catch(err => setError(err.message))
      .finally(() => setLoadingInitial(false));
  }, [eventId]);

  const handleSubmit = async (data: EventDataPayload) => {
    setIsSubmitting(true);
    try {
      await eventosService.actualizarEvento(eventId, data, user?.id_cliente, user?.territorio_id);
      router.push('/actor/events');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ActorDashboardLayout>
      <div className="max-w-3xl mx-auto py-6">
        {loadingInitial ? (
          <div className="flex justify-center p-8 text-[#6b7a63]">Cargando evento...</div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 p-8">
            <p className="text-red-500 font-medium">{error}</p>
            <button 
              onClick={() => router.push('/actor/events')}
              className="text-xs bg-[#557149] text-white px-4 py-2 rounded-lg"
            >
              Volver a eventos
            </button>
          </div>
        ) : initialData ? (
          <EventForm 
            initialData={initialData} 
            onSubmit={handleSubmit} 
            isLoading={isSubmitting} 
            isEditMode 
          />
        ) : null}
      </div>
    </ActorDashboardLayout>
  );
}