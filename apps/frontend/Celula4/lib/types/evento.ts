export interface TerritorioInfo {
  id_territorio: number
  nombre_territorio: string
  region: string | null
}

export interface ActorInfo {
  id_cliente: number
  nombre: string
  email: string
}

export interface EventoDetalle {
  id_evento: number
  nombre: string
  costo_evento: string | null
  capacidad: number | null
  fecha_inicio: string | null
  fecha_fin: string | null
  territorio: TerritorioInfo
  actor_principal: ActorInfo
}
