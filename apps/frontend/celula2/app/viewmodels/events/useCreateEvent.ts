// viewmodels/events/useCreateEvent.ts
// Hook para crear un evento (POST /api/events).
// Actualmente usa mock — preparado para integración real con Django.

import { useState, useCallback } from 'react';
import type { WizardFormData } from './useEventWizard';

interface UseCreateEventReturn {
  createEvent:  (data: WizardFormData) => Promise<void>;
  isLoading:    boolean;
  submitError:  string | null;
}

// ────────────────────────────────────────────
// reemplazar con llamada real a events.service.ts cuando el backend esté disponible

async function mockCreateEvent(data: WizardFormData): Promise<{ id: string }> {
  const response = await fetch('http://localhost:8000/api/events/', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name:             data.name,
      description:      data.description,
      start_date:       data.startDate,
      start_time:       data.startTime,
      end_date:         data.endDate || null,
      end_time:         data.endTime || null,
      //location_name:    data.locationName,
      //location_address: data.locationAddress || null,
      //pricing_type:     data.pricingType,
      price:            data.pricingType === 'paid' ? parseFloat(data.price) : 0,
      //currency:         data.currency,
      capacity:         parseInt(data.capacity, 10),
      //category:         data.category,
      status:           'draft',
    }),
  });

  if (!response.ok) throw new Error('Error al guardar el evento');
  return response.json();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCreateEvent(): UseCreateEventReturn {
  const [isLoading,   setIsLoading]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createEvent = useCallback(async (data: WizardFormData) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      await mockCreateEvent(data);
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : 'Ocurrió un error al guardar el evento. Intenta nuevamente.';
      setSubmitError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createEvent, isLoading, submitError };
}