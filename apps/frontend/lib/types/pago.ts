export type TipoMetodoPago = 'tarjeta' | 'transferencia' | 'billetera'

export type EstadoPago = 'exitoso' | 'fallido' | 'pendiente'

export interface MetodoPago {
  tipo: TipoMetodoPago
  label: string
  icono: string
}

export interface DatosTarjeta {
  titular: string
  numero: string      
  expiracion: string  
  cvv: string
}

export interface PagoResultado {
  id: string
  reservaId: string
  monto: number
  moneda: string       
  metodo: TipoMetodoPago
  ultimosDigitos: string
  fecha: string       
  estado: EstadoPago
}
