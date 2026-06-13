/**
 * Servicio del mapa económico
 * @celula - Celula1
 * Gestiona la obtención de clientes y geocoding para el mapa.
 *
 * Endpoints (públicos, no requieren token):
 *   GET /api/clientes/ - Listar todos los clientes
 *
 * Usa fetch plano (no fetchWithAuth) porque son endpoints públicos.
 * Usa parseApiError para errores consistentes en español.
 *
 * getCoordinates() usa la API de Google Geocoding (externa, no nuestro backend).
 */

import { API_URL } from '@/services/authService';
import { parseApiError } from '@/services/apiError';

export interface ClienteMapa {
  id_cliente: number;
  nombre: string;
  usuario_nombre: string;
  telefono: string | null;
  es_actor: boolean;
  es_lider: boolean;
  es_turista: boolean;
  es_admin: boolean;
  territorio_nombre: string | null;
  tipos_actores: { id: number; nombre_tipo: string }[];
  foto_perfil_url: string | null;
  foto_portada_url: string | null;
  descripcion: string | null;
  activo: boolean;
  direccion: string | null;
  lat?: number;
  lng?: number;
}

export const mapaService = {
  async getClientes(): Promise<ClienteMapa[]> {
    const response = await fetch(`${API_URL}/api/clientes/`);
    if (!response.ok) throw await parseApiError(response);
    return response.json();
  },

  async getCoordinates(address: string): Promise<{ lat: number; lng: number } | null> {
    const key = process.env.NEXT_PUBLIC_GEOCODING_KEY || '';
    if (!key) {
      console.error('NEXT_PUBLIC_GEOCODING_KEY no está configurada');
      return null;
    }
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`
      );
      if (!res.ok) {
        console.warn(`Geocoding HTTP ${res.status} para "${address}"`);
        return null;
      }
      const data = await res.json();
      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].geometry.location;
      }
      console.warn(`Geocoding status=${data.status} para "${address}": ${data.error_message || ''}`);
      return null;
    } catch (err) {
      console.error('Error en geocoding:', err);
      return null;
    }
  },
};
