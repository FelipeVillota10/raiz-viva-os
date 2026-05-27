import { LoginCredentials, RegistroData, Territorio, Moneda, TipoActor, UserPerfil, Solicitud, PerfilActor, ServicioPerfil, Servicio, AdminTerritorio, TerritorioUpdatePayload, ActorTerritorial } from '../models/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export { API_URL };

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('refresh_token');
}

export function setTokens(access: string, refresh: string): void {
  sessionStorage.setItem('access_token', access);
  sessionStorage.setItem('refresh_token', refresh);
}

export function clearAuth(): void {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
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

export function getTokenPayload(): UserPerfil | null {
  const token = getToken();
  if (!token) return null;
  return decodeJWT(token);
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, { ...options, headers });

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
        window.location.href = '/login/inicio';
      }
    }
    throw new Error('Sesión expirada');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Request failed');
  }

  return response;
}

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
    localStorage.setItem('access_token', tokens.access);
    return tokens;
  },
};

export const registroService = {
  async registrarCliente(data: RegistroData): Promise<{ mensaje: string; cliente: any }> {
    const response = await fetch(`${API_URL}/api/registro/cliente/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Error al registrar');
    }

    return response.json();
  },

  async getTerritorios(): Promise<Territorio[]> {
    const response = await fetch(`${API_URL}/api/territorios/`);
    if (!response.ok) throw new Error('Error al obtener territorios');
    return response.json();
  },

  async getMonedas(): Promise<Moneda[]> {
    const response = await fetch(`${API_URL}/api/monedas/`);
    if (!response.ok) throw new Error('Error al obtener monedas');
    return response.json();
  },

  async getTiposActores(): Promise<TipoActor[]> {
    const response = await fetch(`${API_URL}/api/tipos-actores/`);
    if (!response.ok) throw new Error('Error al obtener tipos de actor');
    return response.json();
  },
};

export const solicitudesService = {
  async getSolicitudes(): Promise<Solicitud[]> {
    const response = await fetchWithAuth(`${API_URL}/api/solicitudes/`);
    return response.json();
  },

  async getSolicitud(id: number): Promise<Solicitud> {
    const response = await fetchWithAuth(`${API_URL}/api/solicitudes/${id}/`);
    return response.json();
  },

  async actualizarSolicitud(id: number, data: { estado: string; observaciones?: string }): Promise<Solicitud> {
    const response = await fetchWithAuth(`${API_URL}/api/solicitudes/${id}/actualizar/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

export const actoresLiderService = {
  async getActores(): Promise<ActorTerritorial[]> {
    const response = await fetchWithAuth(`${API_URL}/api/lider/actores/`);
    return response.json();
  },

  async toggleEstadoActor(actorId: number, accion: 'deshabilitar' | 'habilitar'): Promise<{ mensaje: string }> {
    const response = await fetchWithAuth(`${API_URL}/api/lider/actores/${actorId}/toggle-estado/`, {
      method: 'PATCH',
      body: JSON.stringify({ accion }),
    });
    return response.json();
  },
};

export const perfilService = {
  async getPerfil(): Promise<PerfilActor> {
    const response = await fetchWithAuth(`${API_URL}/api/auth/me/`);
    return response.json();
  },

  async actualizarPerfil(data: FormData): Promise<PerfilActor> {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/perfil/actualizar/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Error al actualizar perfil');
    }

    return response.json();
  },

  async getServicios(): Promise<ServicioPerfil[]> {
    const response = await fetchWithAuth(`${API_URL}/api/perfil/servicios/`);
    return response.json();
  },

  async addServicio(servicio_id: number, precio_acordado?: number): Promise<ServicioPerfil> {
    const response = await fetchWithAuth(`${API_URL}/api/perfil/servicios/`, {
      method: 'POST',
      body: JSON.stringify({ servicio_id, precio_acordado }),
    });
    return response.json();
  },

  async updateServicio(servicio_id: number, precio_acordado: number): Promise<ServicioPerfil> {
    const response = await fetchWithAuth(`${API_URL}/api/perfil/servicios/${servicio_id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ precio_acordado }),
    });
    return response.json();
  },

  async deleteServicio(servicio_id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/api/perfil/servicios/${servicio_id}/`, {
      method: 'DELETE',
    });
  },

  async getServiciosCatalogo(): Promise<Servicio[]> {
    const response = await fetch(`${API_URL}/api/servicios/`);
    if (!response.ok) throw new Error('Error al obtener servicios');
    return response.json();
  },
};

export const adminService = {
  async getTerritorios(): Promise<AdminTerritorio[]> {
    const response = await fetchWithAuth(`${API_URL}/api/admin/territorios/`);
    return response.json();
  },

  async getTerritorio(id: number): Promise<AdminTerritorio> {
    const response = await fetchWithAuth(`${API_URL}/api/admin/territorios/${id}/`);
    return response.json();
  },

  async actualizarTerritorio(id: number, data: TerritorioUpdatePayload): Promise<AdminTerritorio> {
    const response = await fetchWithAuth(`${API_URL}/api/admin/territorios/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Error al actualizar territorio');
    }

    return response.json();
  },
};