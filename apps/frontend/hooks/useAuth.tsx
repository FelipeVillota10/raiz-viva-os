/**
 * Hook de autenticación con contexto
 * @celula - Celula1
 * Provee estado de autenticación, login, logout y datos del usuario.
 */

'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService, clearAuth, getTokenPayload } from '@/services/authService';
import { UserPerfil } from '@/models/types';

interface AuthContextType {
  user: UserPerfil | null;
  isAuthenticated: boolean;
  isLider: boolean;
  isActor: boolean;
  isTurista: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<UserPerfil>;
  logout: () => void;
  refreshUser: () => Promise<UserPerfil>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider de autenticación global.
 *
 * Estrategia de inicio:
 *  1. Al montar, intenta restaurar sesión desde el JWT en sessionStorage.
 *  2. Si hay un token válido, setea el usuario optimistamente desde el payload del JWT
 *     (para que la UI reaccione inmediatamente).
 *  3. Luego refresca los datos reales desde el backend (GET /api/auth/me/).
 *
 * Esto evita parpadeos en la UI mientras se carga el perfil.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;
  const isLider = user?.es_lider ?? false;
  const isActor = user?.es_actor ?? false;
  const isTurista = user?.es_turista ?? false;

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setError(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<UserPerfil> => {
    try {
      setLoading(true);
      const perfil = await authService.getPerfil();
      // Normalizar campos que pueden variar según el backend (compatibilidad)
      const u: UserPerfil = {
        ...perfil,
        nombre_completo: perfil.nombre_completo || perfil.nombre,
        id: perfil.id || perfil.id_cliente || perfil.user_id,
      };
      setUser(u);
      setError(null);
      return u;
    } catch (err) {
      logout();
      throw err;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const login = useCallback(async (email: string, password: string): Promise<UserPerfil> => {
    try {
      setLoading(true);
      setError(null);
      await authService.login({ username: email, password });
      return await refreshUser();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    const tokenPayload = getTokenPayload();
    if (tokenPayload) {
      setUser(tokenPayload);
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLider,
        isActor,
        isTurista,
        loading,
        error,
        login,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

  /** Hook de autenticación. Debe usarse dentro de un AuthProvider. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
