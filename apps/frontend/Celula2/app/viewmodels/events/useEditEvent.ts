// viewmodels/events/useEditEvent.ts
// Hook para editar un evento (PATCH /api/events/:id).
// Precarga datos existentes y envia cambios al backend.
 
import { useState, useCallback } from 'react';
import type { WizardFormData } from './useEventWizard';
 
interface UseEditEventReturn {
  loadEvent:   (id: string) => Promise<WizardFormData | null>;
  updateEvent: (id: string, data: WizardFormData) => Promise<void>;
  isLoading:   boolean;
  submitError: string | null;
}
 
// ─── Mock de carga de evento existente ───────────────────────────────────────
// TODO: reemplazar con GET /api/events/:id cuando backend este disponible
 
async function mockLoadEvent(id: string): Promise<WizardFormData> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    imageFile:       null,
    imagePreviewUrl: null,
    name:            'Evento de ejemplo',
    startDate:       '2026-06-15',
    startTime:       '09:00',
    endDate:         '2026-06-15',
    endTime:         '17:00',
    locationName:    'Parque Central de Buitrera',
    locationAddress: 'Carrera 5 #12-34, Palmira',
    description:     'Descripcion de ejemplo del evento cargado desde el backend.',
    pricingType:     'free',
    price:           '',
    currency:        'COP',
    capacity:        '100',
    category:        'Ecoturismo',
  };
}
 
// ─── Mock de actualizacion de evento ─────────────────────────────────────────
// TODO: reemplazar con PATCH /api/events/:id cuando backend este disponible
 
async function mockUpdateEvent(id: string, data: WizardFormData): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
 
  const response = await fetch(`http://localhost:8000/api/events/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name:             data.name,
      description:      data.description,
      start_date:       data.startDate,
      start_time:       data.startTime,
      end_date:         data.endDate || null,
      end_time:         data.endTime || null,
      location_name:    data.locationName,
      location_address: data.locationAddress || null,
      pricing_type:     data.pricingType,
      price:            data.pricingType === 'paid' ? parseFloat(data.price) : 0,
      currency:         data.currency,
      capacity:         parseInt(data.capacity, 10),
      category:         data.category,
    }),
  });
 
  if (!response.ok) throw new Error('Error al actualizar el evento');
}
 
// ─── Hook ─────────────────────────────────────────────────────────────────────
 
export function useEditEvent(): UseEditEventReturn {
  const [isLoading,   setIsLoading]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
 
  const loadEvent = useCallback(async (id: string): Promise<WizardFormData | null> => {
    setIsLoading(true);
    setSubmitError(null);
    try {
      const data = await mockLoadEvent(id);
      return data;
    } catch (err) {
      setSubmitError('Error al cargar el evento');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
 
  const updateEvent = useCallback(async (id: string, data: WizardFormData) => {
    setIsLoading(true);
    setSubmitError(null);
    try {
      await mockUpdateEvent(id, data);
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : 'Error al actualizar el evento. Intenta nuevamente.';
      setSubmitError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);
 
  return { loadEvent, updateEvent, isLoading, submitError };
}