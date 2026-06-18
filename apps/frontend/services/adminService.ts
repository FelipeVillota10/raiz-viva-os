/**
 * Servicio de administración
 * @celula - Celula1
 * Gestiona territorios y líderes desde la perspectiva del administrador.
 *
 * Endpoints (todos requieren token de admin):
 *   GET    /api/admin/territorios/              - Listar territorios
 *   GET    /api/admin/territorios/{id}/         - Obtener territorio
 *   POST   /api/admin/territorios/              - Crear territorio
 *   PATCH  /api/admin/territorios/{id}/         - Actualizar territorio
 *   GET    /api/admin/lideres/                  - Listar líderes
 *   GET    /api/admin/lideres/?disponibles=true - Listar líderes disponibles
 *   GET    /api/admin/lideres/{id}/             - Obtener líder
 *   PATCH  /api/admin/lideres/{id}/             - Actualizar líder (FormData para fotos)
 *
 * Todos usan fetchWithAuth. Los errores los lanza fetchWithAuth automáticamente.
 */

import { fetchWithAuth } from '@/services/authService';
import { AdminTerritorio, AdminLider, PerfilActor, TerritorioUpdatePayload } from '@/models/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const adminService = {
  async getTerritorios(): Promise<AdminTerritorio[]> {
    const response = await fetchWithAuth(`${API_URL}/api/admin/territorios/`);
    return response.json();
  },

  async getTerritorio(id: number): Promise<AdminTerritorio> {
    const response = await fetchWithAuth(`${API_URL}/api/admin/territorios/${id}/`);
    return response.json();
  },

  async actualizarTerritorio(id: number, data: TerritorioUpdatePayload): Promise<AdminTerritorio> {
    const response = await fetchWithAuth(`${API_URL}/api/admin/territorios/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getLideres(): Promise<AdminLider[]> {
    const response = await fetchWithAuth(`${API_URL}/api/admin/lideres/`);
    return response.json();
  },

  async getLideresDisponibles(): Promise<AdminLider[]> {
    const response = await fetchWithAuth(`${API_URL}/api/admin/lideres/?disponibles=true`);
    return response.json();
  },

  async crearTerritorio(data: { nombre_territorio: string; region: string; id_administrador: number }): Promise<AdminTerritorio> {
    const response = await fetchWithAuth(`${API_URL}/api/admin/territorios/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getLider(id: number): Promise<PerfilActor> {
    const response = await fetchWithAuth(`${API_URL}/api/admin/lideres/${id}/`);
    return response.json();
  },

  async registrarLider(data: {
    nombre_completo: string;
    email: string;
    password: string;
    telefono: string;
    id_territorio: number | null;
    activo: boolean;
  }): Promise<unknown> {
    const response = await fetchWithAuth(`${API_URL}/api/usuarios/admin/registrar-lider/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * Actualizar líder con FormData (permite subir fotos de perfil/portada).
   * fetchWithAuth detecta automáticamente que es FormData y no pone
   * Content-Type, permitiendo que el navegador ponga el boundary.
   */
  async actualizarLider(id: number, data: FormData): Promise<PerfilActor> {
    const response = await fetchWithAuth(`${API_URL}/api/admin/lideres/${id}/`, {
      method: 'PATCH',
      body: data,
    });
    return response.json();
  },
};
