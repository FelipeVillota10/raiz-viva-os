import type { Reserva } from '@/lib/types/reserva'

export const mockReserva: Reserva = {
  id: 'RES-001',
  experiencia: {
    id: 'EXP-001',
    nombre: 'Ruta Ancestral del Cacao',
    imagen: '/cocora.jpg',
    precio: 85,
    cantidad: 2,
  },
  serviciosAdicionales: [
    {
      id: 'SVC-001',
      nombre: 'Taller de Chocolate',
      cantidad: 2,
      subtotal: 20,
    },
  ],
  fechaInicio: '2026-10-28',
  fechaFin: '2026-10-28',
  subtotal: 170,
  total: 190,
  estado: 'confirmada',
  participantes: 2,
  ubicacion: 'Buitrera, Palmira, Valle del Cauca',
  hora: '09:00',
  guia: {
    id: 'GUI-001',
    nombre: 'Carlos Mena',
    avatar: undefined,
  },
}

export const mockReservasById: Record<string, Reserva> = {
  [mockReserva.id]: mockReserva,
}
