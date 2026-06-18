/**
 * Servicio de solicitudes de aprobación
 * @celula - Celula1
 * Maneja las solicitudes de registro de actores territoriales.
 *
 * Endpoints (todos requieren token de líder):
 *   GET   /api/solicitudes/                 - Listar solicitudes
 *   GET   /api/solicitudes/{id}/            - Obtener solicitud
 *   PATCH /api/solicitudes/{id}/actualizar/ - Actualizar estado
 *
 * Todos usan fetchWithAuth. Los errores los lanza fetchWithAuth automáticamente.
 */

import { fetchWithAuth } from '@/services/authService';
import { Solicitud } from '@/models/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const solicitudesService = {
  async getSolicitudes(): Promise<Solicitud[]> {
    const response = await fetchWithAuth(`${API_URL}/api/solicitudes/`);
    return response.json();
  },

  async getSolicitud(id: number): Promise<Solicitud> {
    const response = await fetchWithAuth(`${API_URL}/api/solicitudes/${id}/`);
    return response.json();
  },

  async actualizarSolicitud(id: number, data: { estado: string; observaciones?: string }): Promise<Solicitud> {
    const response = await fetchWithAuth(`${API_URL}/api/solicitudes/${id}/actualizar/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
