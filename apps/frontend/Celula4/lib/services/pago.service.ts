import type { IniciarPagoRequest, IniciarPagoResponse, PagoRespuesta, CuponRespuesta } from '@/lib/types/pago'

const BASE = '/api/c/pagos'

async function parseError(res: Response): Promise<string> {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    const body = await res.json().catch(() => ({}))
    return body.error || `Error ${res.status}`
  }
  return `Error ${res.status} del servidor`
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor')
  }
  if (!res.ok) {
    throw new Error(await parseError(res))
  }
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    throw new Error('Respuesta inesperada del servidor')
  }
  return res.json()
}

export async function iniciarPago(data: IniciarPagoRequest): Promise<IniciarPagoResponse> {
  return apiFetch<IniciarPagoResponse>(`${BASE}/iniciar/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function consultarRespuesta(referencia: string): Promise<PagoRespuesta> {
  return apiFetch<PagoRespuesta>(`${BASE}/respuesta/?external_reference=${encodeURIComponent(referencia)}`)
}

export async function validarCupon(codigo: string): Promise<CuponRespuesta> {
  return apiFetch<CuponRespuesta>(`${BASE}/cupones/?codigo=${encodeURIComponent(codigo)}`)
}

export async function descargarComprobante(referencia: string): Promise<Blob> {
  let res: Response
  try {
    res = await fetch(`${BASE}/${encodeURIComponent(referencia)}/comprobante/`)
  } catch {
    throw new Error('No se pudo conectar con el servidor')
  }
  if (!res.ok) {
    throw new Error(await parseError(res))
  }
  return res.blob()
}
