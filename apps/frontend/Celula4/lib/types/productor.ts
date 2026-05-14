export interface DistribucionItem {
  nombre: string
  porcentaje: number
  icono: string
}

export interface DistribucionConfig {
  experienciaNombre: string
  actoresLocales: DistribucionItem[]
  fondoComunitario: number   
  plataforma: number         
  ingresoTotal: number
  totalPersonas: number
}

export interface VentaRegistro {
  fecha: string       
  id: string
  montoNeto: number
}

export interface IngresoMensual {
  mes: string         
  monto: number
}

export interface DashboardProductor {
  saldoDisponible: number
  ingresosNetos: number
  ingresosMensuales: IngresoMensual[]
  ultimasVentas: VentaRegistro[]
}
