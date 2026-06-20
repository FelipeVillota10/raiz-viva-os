/**
 * Tipos e interfaces del frontend Raíz Viva
 * @celula - Celula1
 * Centraliza todas las definiciones de tipos utilizadas en la aplicación.
 */

/** Perfil básico del usuario desde el JWT */
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
  es_admin?: boolean;
  territorio_nombre?: string | null;
  territorio_id?: number | null;
  tipos_actores?: { id: number; nombre_tipo: string }[];
  servicio?: string;
  reputacion?: number;
}

/** Perfil completo del actor territorial */
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

/** Servicio asignado al perfil del actor */
export interface ServicioPerfil {
  id: number;
  servicio_id: number;
  nombre: string;
  descripcion: string | null;
  precio_acordado: number | null;
  unidad: string | null;
}

/** Territorio geográfico */
export interface Territorio {
  id_territorio: number;
  nombre_estado: string;
  nombre_territorio?: string;
}

/** Tipo de moneda */
export interface Moneda {
  id: number;
  nombre_moneda: string;
  nombre?: string;
  simbolo?: string;
}

/** Tipo de actor en el ecosistema */
export interface TipoActor {
  id: number;
  nombre_tipo: string;
  descripcion?: string;
}

/** Servicio del catálogo general */
export interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  precio_base?: number;
  unidad?: string;
}

/** Credenciales para login */
export interface LoginCredentials {
  username: string;
  password: string;
}

/** Datos para registro de cliente */
export interface RegistroData {
  nombre_completo: string;
  email: string;
  password: string;
  telefono: string;
  id_territorio?: number | null;
  id_tipo_moneda?: number | null;
  tipos_actores: number[];
  servicios?: number[];
  es_actor: boolean;
  es_lider: boolean;
  es_turista: boolean;
}

/** Solicitud de aprobación */
export interface Solicitud {
  id: number;
  id_aprobacion: number;
  estado_resultado: 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';
  observaciones: string;
  fecha_solicitud: string;
  fecha_respuesta: string | null;
  actor_info: {
    id: number;
    nombre: string;
    telefono: string;
    usuario_email: string;
    servicio?: string;
    tipos_actores: { id: number; nombre_tipo: string }[];
    territorio_nombre: string | null;
  };
  lider_info: {
    id: number;
    nombre: string;
  };
}

/** Actor territorial (vista del líder) */
export interface ActorTerritorial {
  id_cliente: number;
  nombre: string;
  telefono: string;
  email: string;
  territorio_nombre: string | null;
  tipos_actores: { id: number; nombre_tipo: string }[];
  activo: boolean;
}

/** Líder territorial (vista del admin) */
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

/** Territorio con información completa (vista del admin) */
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

/** Payload para actualizar territorio */
export interface TerritorioUpdatePayload {
  nombre_territorio?: string;
  region?: string;
  id_estado?: number;
  administrador_activo?: boolean;
}

// NUEVA INTERFAZ PARA HU14.A2
export interface ReglasPaquete {
  id: number;
  min_personas: number;
  max_personas: number;
  max_actividades: number;
  fechas_bloqueadas: string[]; // ISO Strings "YYYY-MM-DD"
}
