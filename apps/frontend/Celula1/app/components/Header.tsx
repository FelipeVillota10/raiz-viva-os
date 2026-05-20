'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';

export function Header() {
  const { isAuthenticated, isLider, user, logout } = useAuth();

  return (
    <header className="w-full bg-[#EFF7EA] px-6 py-4">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/RaizLogoCirculo.png"
            alt="Raíz Viva"
            className="w-12 h-12 rounded-full object-cover"
          />
          <span className="text-xl font-semibold text-[#3E853F]">Raíz Viva</span>
        </Link>

        <div className="flex items-center gap-4">
          {isLider ? (
            <>
              <span className="text-sm text-[#353535]">
                Hola, {user?.nombre_completo?.split(' ')[0]}
              </span>
              <Link href="/lider/aprobaciones">
                <Button variant="outline" size="sm">
                  Panel Líder
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                Cerrar Sesión
              </Button>
            </>
          ) : isAuthenticated ? (
            <>
              <span className="text-sm text-[#353535]">
                Hola, {user?.nombre_completo?.split(' ')[0]}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              <Link href="/login/inicio">
                <Button variant="ghost" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/registro">
                <Button variant="primary" size="sm">
                  Crear Cuenta
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}