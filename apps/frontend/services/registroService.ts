/**
 * Servicio de registro de usuarios
 * @celula - Celula1
 * Maneja el registro de nuevos clientes y catálogos.
 *
 * Endpoints (todos públicos, no requieren token):
 *   POST /api/registro/cliente/  - Registrar nuevo cliente
 *   GET  /api/territorios/       - Listar territorios
 *   GET  /api/monedas/           - Listar monedas
 *   GET  /api/tipos-actores/     - Listar tipos de actor
 *   GET  /api/servicios/         - Listar servicios
 *
 * Usa fetch plano (no fetchWithAuth) porque son endpoints públicos.
 * Usa parseApiError para errores consistentes en español.
 */

import { RegistroData, Territorio, Moneda, TipoActor, Servicio } from '@/models/types';
import { parseApiError } from '@/services/apiError';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const registroService = {
  async registrarCliente(data: RegistroData): Promise<{ mensaje: string; cliente: unknown }> {
    const response = await fetch(`${API_URL}/api/registro/cliente/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await parseApiError(response);
    }

    return response.json();
  },

  async getTerritorios(): Promise<Territorio[]> {
    const response = await fetch(`${API_URL}/api/territorios/`);
    if (!response.ok) throw await parseApiError(response);
    return response.json();
  },

  async getMonedas(): Promise<Moneda[]> {
    const response = await fetch(`${API_URL}/api/monedas/`);
    if (!response.ok) throw await parseApiError(response);
    return response.json();
  },

  async getTiposActores(): Promise<TipoActor[]> {
    const response = await fetch(`${API_URL}/api/tipos-actores/`);
    if (!response.ok) throw await parseApiError(response);
    return response.json();
  },

  async getServicios(): Promise<Servicio[]> {
    const response = await fetch(`${API_URL}/api/servicios/`);
    if (!response.ok) throw await parseApiError(response);
    return response.json();
  },
};
