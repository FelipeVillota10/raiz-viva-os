/**
 * Servicio de aprobaciones para el contexto del líder
 * @celula - Celula1
 * Versión simplificada del servicio de solicitudes para el provider de aprobaciones.
 *
 * Endpoints (requiere token de líder):
 *   GET /api/solicitudes/ - Listar solicitudes del líder
 *
 * Usa fetchWithAuth. Los errores los lanza fetchWithAuth automáticamente.
 */

import { fetchWithAuth } from '@/services/authService';

export interface SolicitudAprobacion {
  id_aprobacion: number;
  estado_resultado: string;
  observaciones: string;
  fecha_solicitud: string;
  fecha_respuesta: string | null;
  actor_info: {
    id: number;
    nombre_completo: string;
    telefono: string;
    servicio: string;
    territorio_nombre: string | null;
    tipos_actores: { id: number; nombre_tipo: string }[];
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const aprobacionesService = {
  async getSolicitudes(): Promise<SolicitudAprobacion[]> {
    const response = await fetchWithAuth(`${API_URL}/api/solicitudes/`);
    return response.json();
  },
};
