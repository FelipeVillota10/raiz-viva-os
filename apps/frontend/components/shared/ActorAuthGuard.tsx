'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  children: React.ReactNode;
}

/**
 * Componente que protege las rutas para que solo sean accesibles por actores autenticados.
 * Si el usuario no está autenticado, lo redirige al login.
 * Si está autenticado pero no es actor (es_actor === false), lo redirige a la página principal.
 * 
 * Uso: Envuelve las rutas o layouts que quieras proteger con <ActorAuthGuard>
 */
export function ActorAuthGuard({ children }: Props) {
  const { isAuthenticated, isActor, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo actuamos si ya terminó de cargar el estado de autenticación
    if (!loading) {
      if (!isAuthenticated) {
        // No hay sesión, mandar al login
        router.push('/login'); 
      } else if (!isActor) {
        // Hay sesión pero no es actor, mandar al home u otra página
        router.push('/');
      }
    }
  }, [loading, isAuthenticated, isActor, router]);

  // Mientras carga o si no cumple los requisitos, mostramos un estado de espera
  if (loading || !isAuthenticated || !isActor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-4">
        <div className="w-8 h-8 border-4 border-[#3b5630] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#3b5630] font-medium">Verificando permisos de actor...</p>
      </div>
    );
  }

  // Si todo está bien, renderizamos los hijos
  return <>{children}</>;
}
