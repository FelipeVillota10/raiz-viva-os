/**
 * Servicio de perfil del actor
 * @celula - Celula1
 * Gestiona el perfil, servicios y negocios del actor territorial.
 *
 * Endpoints autenticados (requieren token):
 *   GET   /api/auth/me/                  - Obtener perfil actual
 *   PATCH /api/perfil/actualizar/        - Actualizar perfil (FormData para fotos)
 *   GET   /api/perfil/servicios/         - Listar servicios del perfil
 *   POST  /api/perfil/servicios/         - Agregar servicio al perfil
 *   PATCH /api/perfil/servicios/{id}/    - Actualizar servicio
 *   DELETE /api/perfil/servicios/{id}/   - Eliminar servicio
 *
 * Endpoint público (no requiere token):
 *   GET   /api/servicios/               - Catálogo general de servicios
 *
 * Los endpoints autenticados usan fetchWithAuth (errores automáticos).
 * El endpoint público usa fetch plano + parseApiError.
 */

import { fetchWithAuth } from '@/services/authService';
import { parseApiError } from '@/services/apiError';
import { PerfilActor, ServicioPerfil, Servicio } from '@/models/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const perfilService = {
  async getPerfil(): Promise<PerfilActor> {
    const response = await fetchWithAuth(`${API_URL}/api/auth/me/`);
    return response.json();
  },

  /**
   * Actualizar perfil con FormData (permite subir fotos de perfil/portada).
   * fetchWithAuth detecta automáticamente que es FormData y no pone
   * Content-Type, permitiendo que el navegador ponga el boundary.
   */
  async actualizarPerfil(data: FormData): Promise<PerfilActor> {
    const response = await fetchWithAuth(`${API_URL}/api/perfil/actualizar/`, {
      method: 'PATCH',
      body: data,
    });
    return response.json();
  },

  async getServicios(): Promise<ServicioPerfil[]> {
    const response = await fetchWithAuth(`${API_URL}/api/perfil/servicios/`);
    return response.json();
  },

  async addServicio(servicio_id: number, precio_acordado?: number): Promise<ServicioPerfil> {
    const response = await fetchWithAuth(`${API_URL}/api/perfil/servicios/`, {
      method: 'POST',
      body: JSON.stringify({ servicio_id, precio_acordado }),
    });
    return response.json();
  },

  async updateServicio(servicio_id: number, precio_acordado: number): Promise<ServicioPerfil> {
    const response = await fetchWithAuth(`${API_URL}/api/perfil/servicios/${servicio_id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ precio_acordado }),
    });
    return response.json();
  },

  async deleteServicio(servicio_id: number): Promise<void> {
    const response = await fetchWithAuth(`${API_URL}/api/perfil/servicios/${servicio_id}/`, {
      method: 'DELETE',
    });
    return response.json();
  },

  /** Endpoint público: catálogo general de servicios */
  async getServiciosCatalogo(): Promise<Servicio[]> {
    const response = await fetch(`${API_URL}/api/servicios/`);
    if (!response.ok) throw await parseApiError(response);
    return response.json();
  },
};
