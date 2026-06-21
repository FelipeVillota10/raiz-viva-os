// apps/frontend/services/eventosService.ts
import type { EventStatus, EventPricingType } from '@/models/event.model';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface EventDataPayload {
  name: string;
  description: string;
  category: string;
  pricingType: EventPricingType;
  price: string;
  currency: string;
  capacity: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  locationName: string;
  locationAddress: string;
  imageFile: File | null;
  imagePreviewUrl: string | null;
}

export const eventosService = {
  /**
   * Helper privado para crear el FormData desde el payload del formulario
   */
  _buildFormData(data: EventDataPayload, userId?: number, territorioId?: number): FormData {
    const formData = new FormData();
    formData.append('nombre', data.name);
    formData.append('descripcion', data.description);
    formData.append('costo_evento', data.pricingType === 'paid' ? data.price : '0');
    formData.append('es_gratuito', data.pricingType === 'free' ? 'true' : 'false');
    formData.append('capacidad', data.capacity);
    formData.append('fecha_inicio', `${data.startDate}T${data.startTime || '00:00'}`);
    formData.append('fecha_fin', `${data.endDate || data.startDate}T${data.endTime || '00:00'}`);
    formData.append('id_categoria', String(data.category));

    if (userId) formData.append('id_actor_principal', String(userId));
    if (territorioId) formData.append('id_territorio', String(territorioId));
    if (data.currency) formData.append('id_moneda', data.currency);
    
    // Aquí es donde se adjunta el objeto File de la imagen
    if (data.imageFile) {
      formData.append('imagen', data.imageFile);
    }
    
    // (A futuro: incluir campos de ubicación si el backend los soporta)
    return formData;
  },

  async crearEvento(data: EventDataPayload, userId?: number, territorioId?: number) {
    const formData = this._buildFormData(data, userId, territorioId);
    
    const res = await fetch(`${API_BASE}/api/eventos/`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(JSON.stringify(errorData));
    }
    return res.json();
  },

  async actualizarEvento(eventId: string, data: EventDataPayload, userId?: number, territorioId?: number) {
    const formData = this._buildFormData(data, userId, territorioId);
    
    const res = await fetch(`${API_BASE}/api/eventos/${eventId}/`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(JSON.stringify(errorData));
    }
    return res.json();
  },

  async obtenerEvento(eventId: string): Promise<EventDataPayload> {
    const res = await fetch(`${API_BASE}/api/eventos/${eventId}/`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const item = await res.json();

    const estadoNombre = item.id_estado?.nombre_estado?.toLowerCase() || '';
    if (estadoNombre.includes('inactivo')) {
      throw new Error('No se puede editar un evento inactivo');
    }

    const fechaInicio = new Date(item.fecha_inicio);
    const fechaFin    = new Date(item.fecha_fin);
    
    let loadedCurrency = '';
    if (item.id_moneda) {
      loadedCurrency = typeof item.id_moneda === 'object' ? item.id_moneda.id.toString() : item.id_moneda.toString();
    }

    return {
      imageFile:       null,
      imagePreviewUrl: item.imagen ?? null,
      name:            item.nombre        ?? '',
      startDate:       fechaInicio.toISOString().split('T')[0],
      startTime:       fechaInicio.toTimeString().slice(0, 5),
      endDate:         fechaFin.toISOString().split('T')[0],
      endTime:         fechaFin.toTimeString().slice(0, 5),
      locationName:    '',
      locationAddress: '',
      description:     item.descripcion   ?? '',
      pricingType:     item.es_gratuito ? 'free' : 'paid',
      price:           item.costo_evento  ? String(item.costo_evento) : '',
      currency:        loadedCurrency,
      capacity:        item.capacidad     ? String(item.capacidad) : '',
      category:        item.id_categoria?.id ?? '',
    };
  },

  async inactivarEvento(eventId: string) {
    const res = await fetch(`${API_BASE}/api/eventos/${eventId}/`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'inactivar' }),
    });
    if (!res.ok) throw new Error('Error al inactivar');
    return res.json();
  },

  async publicarEvento(eventId: string) {
    const res = await fetch(`${API_BASE}/api/eventos/${eventId}/`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'publicar' }),
    });
    if (!res.ok) throw new Error('Error al publicar');
    return res.json();
  }
};
