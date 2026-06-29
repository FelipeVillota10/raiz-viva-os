import { fetchWithAuth, API_URL, getTokenPayload } from "./authService";

export interface EcoAventura {
  id: number;
  nombre: string;
  imagen_url: string | null;
  precio: string;
  ubicacion: string;
  dificultad: "BAJA" | "MEDIA" | "ALTA";
  dificultad_display: string;
  duracion: number;
  duracion_display: string;
  descripcion?: string;
  capacidad_maxima?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  activo?: boolean;
  territorio?: number;
  itinerario?: Itinerario | null;
}

export interface Itinerario {
  id?: number;
  cronograma: string;
  actividades: string;
  transporte: string;
  restricciones: string;
  recomendaciones: string;
  contactos: string;
  notas_especiales: string;
  // Nuevos campos integrados para HU13.3:
  sugerencias?: string;
  desglose_costos?: string;
}

export interface PaginatedResponse {
  count: number;
  total_pages: number;
  page: number;
  page_size: number;
  results: EcoAventura[];
}

export interface Filtros {
  precio_min?: string;
  precio_max?: string;
  dificultad?: string;
  ubicacion?: string;
  duracion_min?: string;
  duracion_max?: string;
  page?: number;
}

export const BASE = `${API_URL}/api/ecoaventuras`;

function buildQuery(filtros: Filtros): string {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function getCatalogo(filtros: Filtros = {}): Promise<PaginatedResponse> {
  const res = await fetch(`${BASE}/${buildQuery(filtros)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al cargar el catálogo");
  return res.json();
}

export async function getEcoAventura(id: number): Promise<EcoAventura> {
  const res = await fetch(`${BASE}/${id}/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Eco-aventura no encontrada");
  return res.json();
}

export async function getAllAdmin(mineOnly: boolean = false): Promise<EcoAventura[]> {
  if (mineOnly) {
    const res = await fetchWithAuth(`${BASE}/mine/`, { cache: "no-store" });
    if (!res.ok) throw new Error("Error al cargar mis eco-aventuras");
    return res.json();
  }

  const res = await fetchWithAuth(`${BASE}/admin/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al cargar eco-aventuras");
  return res.json();
}

export async function crearEcoAventura(data: Partial<EcoAventura>): Promise<EcoAventura> {
  const res = await fetchWithAuth(`${BASE}/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(JSON.stringify(err) || `Error ${res.status}`);
  }
  return res.json();
}

/**
 * Permite editar una eco-aventura de forma parcial (PATCH) o total.
 * Ideal para actualizar cupos, disponibilidad o campos específicos.
 */
export async function editarEcoAventura(id: number, data: Partial<EcoAventura>): Promise<EcoAventura> {
  const res = await fetchWithAuth(`${BASE}/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(JSON.stringify(err) || `Error ${res.status}`);
  }
  return res.json();
}

export async function toggleActivo(id: number): Promise<EcoAventura> {
  const res = await fetchWithAuth(`${BASE}/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ toggle_activo: true }),
  });
  if (!res.ok) throw new Error("Error al cambiar estado");
  return res.json();
}

export async function getItinerario(id: number): Promise<Itinerario | null> {
  const res = await fetch(`${BASE}/${id}/itinerario/`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.itinerario === null ? null : data;
}

export async function guardarItinerario(id: number, data: Itinerario): Promise<Itinerario> {
  const res = await fetchWithAuth(`${BASE}/${id}/itinerario/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(JSON.stringify(err) || `Error ${res.status}`);
  }
  return res.json();
}

export async function guardarReglasOperativas(id: number, reglas: any) {
  try {
    const response = await fetchWithAuth(`${BASE}/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({
        min_personas: reglas.minPersonas,
        capacidad_maxima: reglas.maxPersonas,
        max_actividades: reglas.maxActividades,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Error en el servidor (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en guardarReglasOperativas:", error);
    throw error;
  }
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('imagen', file);
  const res = await fetchWithAuth(`${BASE}/upload-image/`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || `Error al subir imagen (${res.status})`);
  }
  const data = await res.json();
  return data.url;
}
