// models/event.model.ts
// Entidad Event, constantes y tipos del dominio de eventos
 
// ─── Status ───────────────────────────────────────────────────────────────────
 
export type EventStatus = string;
 
export type EventPricingType = 'free' | 'paid';
 
// ─── Entidad principal ────────────────────────────────────────────────────────
 
export interface Event {
  id:          string;
  name:        string;
  description: string;
  category: string;
  pricingType: EventPricingType;
  price: number;
  currency: string;
  capacity: number;
  startDate: string;
  status: EventStatus;
}

// Configuración para validación de imágenes de eventos
export const IMAGE_CONFIG = {
  acceptedTypes: ['image/jpeg', 'image/png', 'image/jpg'] as string[],
  maxSizeBytes:  5 * 1024 * 1024, // 5 MB
  acceptString:  'image/jpeg,image/jpg,image/png',
} as const;

// ─── Categorías (mock — reemplazar con GET /api/categories) ──────────────────

export const EVENT_CATEGORIES = [
  'Ecoturismo',
  'Gastronomía',
  'Cultura y Arte',
  'Agricultura',
  'Talleres',
  'Senderismo',
  'Festivales',
  'Educativo',
  'Bienestar',
  'Fotografía',
  'Música',
  'Voluntariado',
] as const;
 
export type EventCategory = typeof EVENT_CATEGORIES[number];