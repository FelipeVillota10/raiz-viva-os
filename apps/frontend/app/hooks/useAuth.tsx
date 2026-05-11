'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getToken, getTokenPayload, clearAuth, UserPerfil } from '../lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLider: boolean;
  isActor: boolean;
  isTurista: boolean;
  user: UserPerfil | null;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLider: false,
  isActor: false,
  isTurista: false,
  user: null,
  logout: () => {},
  refreshUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPerfil | null>(null);

  const refreshUser = () => {
    const payload = getTokenPayload();
    setUser(payload);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const isAuthenticated = !!getToken() && !!user;
  const isLider = user?.es_lider ?? false;
  const isActor = user?.es_actor ?? false;
  const isTurista = user?.es_turista ?? false;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLider, isActor, isTurista, user, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}