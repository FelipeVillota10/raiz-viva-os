export interface IniciarPagoRequest {
  monto: number
  moneda?: string
  email_comprador: string
  nombre_comprador: string
  descripcion: string
  codigo_cupon?: string
  id_cliente?: number | null
  id_evento?: string | null
  frontend_base_url?: string
}

export interface IniciarPagoResponse {
  preference_id: string
  init_point: string
  sandbox_init_point: string
  referencia: string
}

export interface PagoRespuesta {
  id_pago: number
  estado: number
  id_cliente: number | null
  monto: string
  moneda: string
  fecha_creacion: string
  fecha_confirmacion: string | null
  referencia: string
  preference_id: string | null
  mp_payment_id: string | null
  mp_status?: string
}

export const ESTADO_PAGO_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Pendiente', color: 'amarillo' },
  2: { label: 'Aprobado', color: 'verde' },
  3: { label: 'Declinado', color: 'rojo' },
  4: { label: 'Expirado', color: 'gris' },
}

export interface CuponRespuesta {
  id_cupon: number
  codigo: string
  tipo: string
  valor: string
  fecha_inicio: string
  fecha_fin: string
  usos: number
  veces_usado: number
  disponible: boolean
}
