// app/(actor)/events/create/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActorDashboardLayout } from '@/components/layouts/ActorDashboardLayout';
import { EventForm } from '@/components/events/EventForm';
import { eventosService, type EventDataPayload } from '@/services/eventosService';
import { useAuth } from '@/hooks/useAuth';

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: EventDataPayload) => {
    setIsLoading(true);
    try {
      await eventosService.crearEvento(data, user?.id_cliente);
      router.push('/actor/events');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ActorDashboardLayout>
      <div className="max-w-3xl mx-auto py-6">
        <EventForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </ActorDashboardLayout>
  );
}
