// viewmodels/events/useCreateEvent.ts
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { WizardFormData } from './event.types';
/*import { getStoredEvents, saveStoredEvents } from './useEventList';
import type { EventListItem } from './useEventList';*/

interface UseCreateEventReturn {
  createEvent:  (data: WizardFormData) => Promise<void>;
  isLoading:    boolean;
  submitError:  string | null;
}

export function useCreateEvent(): UseCreateEventReturn {
  const [isLoading,   setIsLoading]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const createEvent = useCallback(async (data: WizardFormData) => {
  setIsLoading(true);
  setSubmitError(null);

  try {
    const formDataToSend = new FormData();
    formDataToSend.append('nombre',       data.name);
    formDataToSend.append('descripcion',  data.description);
    formDataToSend.append('costo_evento', data.pricingType === 'paid' ? data.price : '0');
    formDataToSend.append('es_gratuito',  data.pricingType === 'free' ? 'true' : 'false');
    formDataToSend.append('capacidad',    data.capacity);
    formDataToSend.append('fecha_inicio', `${data.startDate}T${data.startTime || '00:00'}`);
    formDataToSend.append('fecha_fin',    `${data.endDate || data.startDate}T${data.endTime || '00:00'}`);
    formDataToSend.append('id_categoria', String(data.category));

    if (data.imageFile) {
      formDataToSend.append('imagen', data.imageFile);
    }

    const response = await fetch('http://localhost:8000/api/eventos/', {
      method: 'POST',
      body: formDataToSend,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    router.push('/actor/events');

  } catch (err) {
    const message = err instanceof Error
      ? err.message
      : 'Ocurrió un error al guardar el evento.';
    setSubmitError(message);
  } finally {
    setIsLoading(false);
  }
}, [router]);

  return { createEvent, isLoading, submitError };
}