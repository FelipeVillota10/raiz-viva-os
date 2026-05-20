import type { DashboardProductor, DistribucionConfig } from '@/lib/types/productor'

export const mockDashboard: DashboardProductor = {
  saldoDisponible: 450,
  ingresosNetos: 2340,
  ingresosMensuales: [
    { mes: 'May', monto: 180 },
    { mes: 'Jun', monto: 320 },
    { mes: 'Jul', monto: 290 },
    { mes: 'Ago', monto: 410 },
    { mes: 'Sep', monto: 375 },
    { mes: 'Oct', monto: 480 },
    { mes: 'Nov', monto: 155 },
    { mes: 'Dic', monto: 130 },
  ],
  ultimasVentas: [
    { fecha: '2026-10-28', id: 'RVOS-987654', montoNeto: 190 },
    { fecha: '2026-10-21', id: 'RVOS-876543', montoNeto: 95 },
    { fecha: '2026-10-14', id: 'RVOS-765432', montoNeto: 190 },
    { fecha: '2026-10-07', id: 'RVOS-654321', montoNeto: 85 },
    { fecha: '2026-09-30', id: 'RVOS-543210', montoNeto: 190 },
  ],
}

export const mockDistribucion: DistribucionConfig = {
  experienciaNombre: 'Ruta Ancestral del Cacao',
  actoresLocales: [
    { nombre: 'Guía local', porcentaje: 40, icono: '🧭' },
    { nombre: 'Familia productora', porcentaje: 30, icono: '🌿' },
  ],
  fondoComunitario: 10,
  plataforma: 20,
  ingresoTotal: 190,
  totalPersonas: 2,
}
