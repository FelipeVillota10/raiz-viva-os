'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function Header() {
  const { isAuthenticated, isLider, user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="flex justify-between items-center px-4 py-2 h-16 bg-[#3b5630] text-white">
      <div className="flex items-center gap-2">
        <Image
          src="/raiz_header.png"
          alt="Logo de Raiz Viva"
          width={256}
          height={256}
          className="w-64 h-64 object-contain mt-2"
        />
      </div>

      <div className="flex items-center gap-4">
        {isLider ? (
          <>
            <span className="text-sm text-white">
              Hola, {user?.nombre_completo?.split(' ')[0]}
            </span>
            <button
              onClick={() => router.push('/lider/aprobaciones')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition"
            >
              Panel Líder
            </button>
            <button
              onClick={logout}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition"
            >
              Cerrar Sesión
            </button>
          </>
        ) : isAuthenticated ? (
          <>
            <span className="text-sm text-white">
              Hola, {user?.nombre_completo?.split(' ')[0]}
            </span>
            <button
              onClick={logout}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition"
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          <>
            <Link href="/login/inicio">
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition">
                Iniciar Sesión
              </button>
            </Link>
            <Link href="/registro">
              <button className="bg-white hover:bg-white/90 text-[#3b5630] px-4 py-2 rounded-full text-sm font-medium transition">
                Crear Cuenta
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}