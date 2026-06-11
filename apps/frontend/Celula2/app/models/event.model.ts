// models/event.model.ts
// Entidad Event, constantes y tipos del dominio de eventos
 
// ─── Status ───────────────────────────────────────────────────────────────────
 
export type EventStatus = 'draft' | 'pending' | 'active' | 'inactive';
 
export type EventPricingType = 'free' | 'paid';
 
// ─── Entidad principal ────────────────────────────────────────────────────────
 
export interface Event {
  id:          string;
  name:        string;
  description: string;
  imageUrl:    string | null;
  startDate:   string;        // ISO date string
  startTime:   string;        // HH:MM
  endDate:     string | null;
  endTime:     string | null;
  locationName:    string;
  locationAddress: string | null;
  pricingType: EventPricingType;
  price:       number;
  currency:    string;
  capacity:    number;
  category:    string;
  status:      EventStatus;
  createdAt:   string;
  updatedAt:   string;
}
 
// ─── Imagen ───────────────────────────────────────────────────────────────────
 
export const IMAGE_CONFIG = {
  acceptedTypes: ['image/jpeg', 'image/png', 'image/jpg'] as string[],
  maxSizeBytes:  5 * 1024 * 1024, // 5 MB
  acceptString:  'image/jpeg,image/jpg,image/png',
} as const;
 
// ─── Divisas soportadas ───────────────────────────────────────────────────────
 
export const SUPPORTED_CURRENCIES = [
  { code: 'COP', symbol: '$',  name: 'Peso colombiano' },
  { code: 'USD', symbol: '$',  name: 'Dólar estadounidense' },
  { code: 'EUR', symbol: '€',  name: 'Euro' },
  { code: 'MXN', symbol: '$',  name: 'Peso mexicano' },
  { code: 'BRL', symbol: 'R$', name: 'Real brasileño' },
] as const;
 
export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];
 
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