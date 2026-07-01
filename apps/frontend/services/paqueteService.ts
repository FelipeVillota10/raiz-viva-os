import { getToken } from "@/services/authService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface EcoAventuraResumen {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  portada: string | null;
  duracion: string;
  ubicacion: string;
}

export interface PaqueteItem {
  id: number;
  ecoaventura: EcoAventuraResumen;
  cantidad: number;
  fecha_reserva: string | null;
  num_personas: number;
  subtotal: number;
  agregado_en: string;
}

export interface Paquete {
  id: number;
  session_key: string;
  items: PaqueteItem[];
  total: number;
  num_items: number;
  /** HU16.2: turista autenticado dueño del paquete (null si aún anónimo). */
  usuario_id: number | null;
  usuario_nombre: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface AgregarExperienciaPayload {
  ecoaventura_id: number;
  fecha_reserva?: string | null;
  num_personas: number;
}

export interface PaqueteError {
  error: string;
  code: string;
}

/** Registro creado en consolidado_experiencias al confirmar el pago del paquete. */
export interface ConfirmacionPago {
  id_consolidado_exp: number;
  cliente: number;
  paquete: number;
  monto_pagado: string;
  fecha_participacion: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw data as PaqueteError;
  return data as T;
}

export const paqueteService = {
  async obtener(): Promise<Paquete> {
    const res = await fetch(`${BASE_URL}/paquete/`, {
      credentials: "include",
    });
    return handleResponse<Paquete>(res);
  },

  async agregar(payload: AgregarExperienciaPayload): Promise<Paquete> {
    const res = await fetch(`${BASE_URL}/paquete/agregar/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<Paquete>(res);
  },

  async eliminarItem(itemId: number): Promise<Paquete> {
    const res = await fetch(`${BASE_URL}/paquete/items/${itemId}/`, {
      method: "DELETE",
      credentials: "include",
    });
    return handleResponse<Paquete>(res);
  },

  async vaciar(): Promise<void> {
    const res = await fetch(`${BASE_URL}/paquete/`, {
      method: "DELETE",
      credentials: "include",
    });
    return handleResponse<void>(res);
  },

  /**
   * HU16.2: asocia el paquete de la sesión actual al turista autenticado.
   * Requiere haber iniciado sesión (login de Célula 1): envía el JWT en el
   * header Authorization y la cookie de sesión (credentials: "include") para
   * que el backend ligue el paquete al usuario antes de proceder al pago.
   */
  async asociarUsuario(): Promise<Paquete> {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/paquete/asociar/`, {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return handleResponse<Paquete>(res);
  },

  /**
   * Proceder al pago: confirma el pago del paquete ya asociado al turista
   * autenticado. El backend calcula el monto desde los items del paquete
   * en NEON y guarda un único registro en consolidado_experiencias.
   */
  async confirmarPago(paqueteId: number): Promise<ConfirmacionPago> {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/paquete/pagar/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ paquete_id: paqueteId }),
    });
    return handleResponse<ConfirmacionPago>(res);
  },
};