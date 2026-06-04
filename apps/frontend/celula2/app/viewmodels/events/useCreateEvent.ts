// viewmodels/events/useCreateEvent.ts
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { WizardFormData } from './event.types';
import { getStoredEvents, saveStoredEvents } from './useEventList';
import type { EventListItem } from './useEventList';

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
      // TODO: reemplazar por fetch real cuando backend esté disponible
      await new Promise((r) => setTimeout(r, 500));

      const newEvent: EventListItem = {
        id:          crypto.randomUUID(),
        name:        data.name,
        description: data.description,
        category:    data.category,
        pricingType: data.pricingType,
        price:       data.pricingType === 'paid' ? parseFloat(data.price) : 0,
        currency:    data.currency,
        capacity:    parseInt(data.capacity, 10),
        startDate:   data.startDate,
        status:      'draft',
      };

      const existing = getStoredEvents();
      saveStoredEvents([...existing, newEvent]);

      router.push('/actor/events');

    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : 'Ocurrió un error al guardar el evento. Intenta nuevamente.';
      setSubmitError(message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return { createEvent, isLoading, submitError };
}