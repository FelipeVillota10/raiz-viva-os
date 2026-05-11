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

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

export function decodeJWT(token: string): UserPerfil | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch {
    return null;
  }
}

export async function getUserPerfil(): Promise<UserPerfil | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_URL}/api/auth/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

export function clearAuth(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export function getTokenPayload(): UserPerfil | null {
  const token = getToken();
  if (!token) return null;
  return decodeJWT(token);
}