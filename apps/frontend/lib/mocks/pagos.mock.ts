import type { PagoResultado } from '@/lib/types/pago'

export const mockPagoExitoso: PagoResultado = {
  id: 'RVOS-987654',
  reservaId: 'RES-001',
  monto: 190,
  moneda: 'USD',
  metodo: 'tarjeta',
  ultimosDigitos: '1234',
  fecha: '2026-10-15T14:32:00Z',
  estado: 'exitoso',
}

export const mockPagoFallido: PagoResultado = {
  id: 'RVOS-000001',
  reservaId: 'RES-001',
  monto: 190,
  moneda: 'USD',
  metodo: 'tarjeta',
  ultimosDigitos: '9999',
  fecha: '2026-10-15T14:30:00Z',
  estado: 'fallido',
}
