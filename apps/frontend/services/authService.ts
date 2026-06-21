/**
 * Servicio de autenticación
 * @celula - Celula1
 * Maneja tokens JWT, login, logout y refresh.
 *
 * Endpoints:
 *   POST /api/token/          - Obtener tokens de acceso
 *   POST /api/token/refresh/  - Renovar token de acceso
 *   GET  /api/auth/me/        - Obtener perfil del usuario autenticado
 */

import { LoginCredentials, UserPerfil } from '@/models/types';
import { ApiError } from '@/services/apiError';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export { API_URL };

/** Obtiene el access token desde sessionStorage. Retorna null si no existe o en SSR. */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('access_token');
}

/** Obtiene el refresh token desde sessionStorage. Retorna null si no existe o en SSR. */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('refresh_token');
}

/** Guarda access y refresh token en sessionStorage. */
export function setTokens(access: string, refresh: string): void {
  sessionStorage.setItem('access_token', access);
  sessionStorage.setItem('refresh_token', refresh);
}

/** Elimina ambos tokens de sessionStorage (cierra sesión). */
export function clearAuth(): void {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
}

/**
 * Decodifica el payload de un JWT sin verificar la firma.
 *
 * Usa base64url→base64 (reemplaza -→+ y _→/) antes de decodificar con atob().
 * Retorna null si el token es inválido o no se puede decodificar.
 */
export function decodeJWT(token: string): UserPerfil | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch {
    return null;
  }
}

/** Obtiene el payload del JWT almacenado, o null si no hay token válido. */
export function getTokenPayload(): UserPerfil | null {
  const token = getToken();
  if (!token) return null;
  return decodeJWT(token);
}

/**
 * Wrapper de fetch con autenticación automática.
 *
 * Flujo:
 *  1. Agrega el header Authorization con el access token actual.
 *  2. Si el body es FormData (archivos/fotos), NO pone Content-Type
 *     para que el navegador ponga el boundary automáticamente.
 *  3. Si la respuesta es 401, intenta renovar el token con el refresh token.
 *  4. Si la renovación falla, limpia la sesión y redirige al login.
 *  5. Si la respuesta es otro error, lanza un ApiError con mensaje en español.
 */
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  // Solo poner Content-Type JSON si NO es FormData.
  // FormData necesita que el navegador ponga el boundary automáticamente.
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, { ...options, headers });

  // Si el token expiró, intentar renovarlo
  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_URL}/api/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setTokens(data.access, refreshToken);
          (headers as Record<string, string>)['Authorization'] = `Bearer ${data.access}`;
          response = await fetch(url, { ...options, headers });
          if (response.ok) return response;
        }
      } catch {
        // fall through to error
      }
    }

    clearAuth();
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/lider')) {
        window.location.href = '/lider/login';
      } else {
        window.location.href = '/login';
      }
    }
    throw new Error('Sesión expirada');
  }

  // Cualquier otro error se empaqueta en ApiError con mensaje en español
  if (!response.ok) {
    let apiErr: ApiError;
    try {
      const cloned = response.clone();
      const data = await cloned.json();
      apiErr = new ApiError(
        (data && typeof data === 'object' && 'detail' in data) ? String(data.detail) : `Error ${response.status}`,
        response.status,
        {},
        JSON.stringify(data).substring(0, 500)
      );
    } catch {
      try {
        const text = await response.clone().text();
        apiErr = new ApiError(text || `Error ${response.status}`, response.status);
      } catch {
        apiErr = new ApiError(`Error ${response.status}`, response.status);
      }
    }
    throw apiErr;
  }

  return response;
}

export { fetchWithAuth };

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ access: string; refresh: string }> {
    const response = await fetch(`${API_URL}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Credenciales inválidas');
    }

    const tokens = await response.json();
    setTokens(tokens.access, tokens.refresh);
    return tokens;
  },

  async getPerfil(): Promise<UserPerfil> {
    const response = await fetchWithAuth(`${API_URL}/api/auth/me/`);
    return response.json();
  },

  async refreshToken(): Promise<{ access: string }> {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error('No refresh token');

    const response = await fetch(`${API_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      clearAuth();
      throw new Error('Session expired');
    }

    const tokens = await response.json();
    sessionStorage.setItem('access_token', tokens.access);
    return tokens;
  },
};
