export interface UserPerfil {
  id: number;
  nombre_completo: string;
  telefono: string;
  usuario_email: string;
  es_actor: boolean;
  es_lider: boolean;
  es_turista: boolean;
  territorio_nombre: string | null;
  territorio_id: number | null;
  tipos_actores: { id: number; nombre_tipo: string }[];
  servicio: string;
  reputacion: number;
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