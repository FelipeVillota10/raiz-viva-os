import type { Event } from '@/models/event.model'

const BASE = '/api/c/eventos'

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
  return res.json()
}
