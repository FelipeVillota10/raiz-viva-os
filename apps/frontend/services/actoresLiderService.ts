/**
 * Servicio de actores para líderes
 * @celula - Celula1
 * Gestiona actores territoriales desde la perspectiva del líder.
 *
 * Endpoints (todos requieren token de líder):
 *   GET   /api/lider/actores/                       - Listar actores del territorio
 *   PATCH /api/lider/actores/{id}/toggle-estado/    - Habilitar/deshabilitar actor
 *
 * Todos usan fetchWithAuth. Los errores los lanza fetchWithAuth automáticamente.
 */

import { fetchWithAuth } from '@/services/authService';
import { ActorTerritorial } from '@/models/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const actoresLiderService = {
  async getActores(): Promise<ActorTerritorial[]> {
    const response = await fetchWithAuth(`${API_URL}/api/lider/actores/`);
    return response.json();
  },

  async toggleEstadoActor(actorId: number, accion: 'deshabilitar' | 'habilitar'): Promise<{ mensaje: string }> {
    const response = await fetchWithAuth(`${API_URL}/api/lider/actores/${actorId}/toggle-estado/`, {
      method: 'PATCH',
      body: JSON.stringify({ accion }),
    });
    return response.json();
  },
};
