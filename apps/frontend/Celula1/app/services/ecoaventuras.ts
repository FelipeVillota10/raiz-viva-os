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

const BASE = "/api/ecoaventuras";

function buildQuery(filtros: Filtros): string {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function leerErrorJSON(res: Response): Promise<string> {
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const data = await res.json();
    return JSON.stringify(data);
  }
  return `Error ${res.status}: el servidor no está disponible. Verifica que el backend esté corriendo en el puerto 8000.`;
}

export async function getCatalogo(filtros: Filtros = {}): Promise<PaginatedResponse> {
  const res = await fetch(`${BASE}/${buildQuery(filtros)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(await leerErrorJSON(res));
  return res.json();
}

export async function getAllAdmin(): Promise<EcoAventura[]> {
  const res = await fetch(`${BASE}/admin/`, { cache: "no-store" });
  if (!res.ok) throw new Error(await leerErrorJSON(res));
  return res.json();
}

export async function crearEcoAventura(data: Partial<EcoAventura>): Promise<EcoAventura> {
  const res = await fetch(`${BASE}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await leerErrorJSON(res));
  return res.json();
}

export async function editarEcoAventura(id: number, data: Partial<EcoAventura>): Promise<EcoAventura> {
  const res = await fetch(`${BASE}/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await leerErrorJSON(res));
  return res.json();
}

export async function toggleActivo(id: number): Promise<EcoAventura> {
  const res = await fetch(`${BASE}/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toggle_activo: true }),
  });
  if (!res.ok) throw new Error(await leerErrorJSON(res));
  return res.json();
}

export async function getItinerario(id: number): Promise<Itinerario | null> {
  const res = await fetch(`${BASE}/${id}/itinerario/`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.itinerario === null ? null : data;
}

export async function guardarItinerario(id: number, data: Itinerario): Promise<Itinerario> {
  const res = await fetch(`${BASE}/${id}/itinerario/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await leerErrorJSON(res));
  return res.json();
}
