'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearAuth } from '../../services/api';

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
        active
          ? 'bg-white/20 text-white'
          : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </Link>
  );
}

export function AdminHeader() {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/admin/login';
  };

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
        {isLoginPage ? (
          <span className="font-medium text-base hidden sm:inline self-center">Inicio de Sesión - Administrador</span>
        ) : (
          <span className="font-medium text-base hidden sm:inline self-center">Panel Administrador</span>
        )}
      </div>

      {!isLoginPage && (
        <div className="flex items-center gap-2">
          <NavLink href="/admin/territorios" active={pathname.startsWith('/admin/territorios')}>
            Territorios
          </NavLink>
          <NavLink href="/admin/lideres" active={pathname.startsWith('/admin/lideres')}>
            Líderes
          </NavLink>
          <Link
            href="/admin/lideres/nuevo"
            className="px-3 py-1.5 rounded-full text-sm font-medium transition bg-[#8c9a80] text-white hover:bg-[#748171]"
          >
            + Nuevo Líder
          </Link>
          <button
            onClick={handleLogout}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ml-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      )}
    </header>
  );
}
