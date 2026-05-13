export interface Experiencia {
  id: string
  nombre: string
  imagen: string
  precio: number
  cantidad: number
}

export interface ServicioAdicional {
  id: string
  nombre: string
  cantidad: number
  subtotal: number
}

export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada'

export interface Reserva {
  id: string
  experiencia: Experiencia
  serviciosAdicionales: ServicioAdicional[]
  fechaInicio: string   
  fechaFin: string
  subtotal: number
  total: number
  estado: EstadoReserva
  participantes: number
  ubicacion: string
  hora: string          
  guia: {
    id: string
    nombre: string
    avatar?: string
  }
}
