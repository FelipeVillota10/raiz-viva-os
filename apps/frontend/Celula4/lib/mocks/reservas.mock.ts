import type { Reserva } from '@/lib/types/reserva'

export const mockReserva: Reserva = {
  id: 'RES-001',
  experiencia: {
    id: 'EXP-001',
    nombre: 'Ruta Ancestral del Cacao',
    imagen: 'https://placehold.co/400x300/f5f0e8/3b5630?text=Ruta+del+Cacao',
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
    avatar: 'https://placehold.co/100x100/d1d5db/4b5563?text=DR',
  },
}

export const mockReservasById: Record<string, Reserva> = {
  [mockReserva.id]: mockReserva,
}
