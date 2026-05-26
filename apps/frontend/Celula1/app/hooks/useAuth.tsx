'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService, clearAuth, getTokenPayload } from '../services/api';
import { UserPerfil } from '../models/types';

interface AuthContextType {
  user: UserPerfil | null;
  isAuthenticated: boolean;
  isLider: boolean;
  isActor: boolean;
  isTurista: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const perfil = await authService.getPerfil();
      setUser({
        ...perfil,
        nombre_completo: perfil.nombre_completo || perfil.nombre,
        id: perfil.id || perfil.id_cliente || perfil.user_id,
      });
      setError(null);
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.login({ username: email, password });
      await refreshUser();
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}