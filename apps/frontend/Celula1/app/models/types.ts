export interface UserPerfil {
  id?: number;
  user_id?: number;
  id_cliente?: number;
  nombre_completo?: string;
  nombre?: string;
  telefono?: string;
  usuario_email?: string;
  es_actor?: boolean;
  es_lider?: boolean;
  es_turista?: boolean;
  territorio_nombre?: string | null;
  territorio_id?: number | null;
  tipos_actores?: { id: number; nombre_tipo: string }[];
  servicio?: string;
  reputacion?: number;
}

export interface PerfilActor {
  id_cliente: number;
  nombre: string;
  telefono: string;
  usuario_email: string;
  es_actor: boolean;
  es_lider: boolean;
  es_turista: boolean;
  territorio_nombre: string | null;
  territorio_id: number | null;
  moneda_nombre: string | null;
  tipos_actores: { id: number; nombre_tipo: string }[];
  servicio: string;
  reputacion: number | null;
  descripcion: string | null;
  foto_perfil: string | null;
  foto_portada: string | null;
  foto_perfil_url: string | null;
  foto_portada_url: string | null;
  activo: boolean;
  estado_aprobacion: string | null;
  observaciones: string | null;
}

export interface ServicioPerfil {
  id: number;
  servicio_id: number;
  nombre: string;
  descripcion: string | null;
  precio_acordado: number | null;
  unidad: string | null;
}

export interface Territorio {
  id_territorio: number;
  nombre_estado: string;
}

export interface Moneda {
  id: number;
  nombre_moneda: string;
}

export interface TipoActor {
  id: number;
  nombre_tipo: string;
}

export interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  precio_base?: number;
  unidad?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegistroData {
  nombre_completo: string;
  email: string;
  password: string;
  telefono: string;
  id_territorio?: number;
  id_tipo_moneda?: number;
  tipos_actores: number[];
  servicios?: number[];
  es_actor: boolean;
  es_lider: boolean;
  es_turista: boolean;
}

export interface Solicitud {
  id: number;
  estado_resultado: 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';
  observaciones: string;
  fecha_solicitud: string;
  fecha_respuesta: string | null;
  actor_info: {
    id: number;
    nombre: string;
    telefono: string;
    usuario_email: string;
    tipos_actores: { id: number; nombre_tipo: string }[];
    territorio_nombre: string | null;
  };
  lider_info: {
    id: number;
    nombre: string;
  };
}

export interface ActorTerritorial {
  id_cliente: number;
  nombre: string;
  telefono: string;
  email: string;
  territorio_nombre: string | null;
  tipos_actores: { id: number; nombre_tipo: string }[];
  activo: boolean;
}

export interface AdminLider {
  id_cliente: number;
  nombre: string;
  telefono: string;
  usuario_email: string;
  activo: boolean;
  foto_perfil_url: string | null;
  territorio_nombre: string | null;
  territorio_id: number | null;
}

export interface AdminTerritorio {
  id_territorio: number;
  nombre_territorio: string;
  region: string;
  estado_nombre: string;
  id_estado: number;
  administrador_nombre: string;
  administrador_id: number;
  administrador_activo: boolean;
}

export interface TerritorioUpdatePayload {
  nombre_territorio?: string;
  region?: string;
  id_estado?: number;
  administrador_activo?: boolean;
}
