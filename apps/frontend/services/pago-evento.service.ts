import type { Event } from '@/models/event.model'

const BASE = '/api/c/eventos'

type BackendEventoResponse = {
  id_evento?: number | string
  nombre?: string | null
  descripcion?: string | null
  costo_evento?: number | string | null
  capacidad?: number | string | null
  fecha_inicio?: string | null
  es_gratuito?: boolean | null
  id_estado?: number | string | { id?: number | string; nombre_estado?: string } | null
  id_categoria?: number | string | { id?: number | string; nombre?: string | null } | null
}

function toNumber(value: unknown): number {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function mapBackendEventoToEvent(item: BackendEventoResponse): Event {
  const categoria = item.id_categoria
  const estado = item.id_estado

  return {
    id: String(item.id_evento ?? ''),
    name: item.nombre ?? '',
    description: item.descripcion ?? '',
    category: typeof categoria === 'object' && categoria !== null
      ? categoria.nombre ?? String(categoria.id ?? '')
      : String(categoria ?? ''),
    pricingType: item.es_gratuito ? 'free' : 'paid',
    price: toNumber(item.costo_evento),
    currency: 'COP',
    capacity: toNumber(item.capacidad),
    startDate: item.fecha_inicio ?? '',
    status: typeof estado === 'object' && estado !== null
      ? estado.nombre_estado ?? String(estado.id ?? '')
      : String(estado ?? ''),
  }
}

export async function obtenerEvento(id: number): Promise<Event> {
  let res: Response
  try {
    res = await fetch(`${BASE}/${id}/`)
  } catch {
    throw new Error('No se pudo conectar con el servidor')
  }
  if (!res.ok) {
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `Error ${res.status}`)
    }
    throw new Error(`Error ${res.status} del servidor`)
  }
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    throw new Error('Respuesta inesperada del servidor')
  }
  const item = await res.json()
  return mapBackendEventoToEvent(item)
}
