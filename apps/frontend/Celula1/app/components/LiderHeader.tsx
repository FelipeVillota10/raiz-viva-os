'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { clearAuth } from '../services/api';

export function LiderHeader() {
  const pathname = usePathname();
  const isLoginPage = pathname === '/lider/login';

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/lider/login';
  };

  return (
    <header className="flex justify-between items-center px-4 py-2 h-16 bg-[#3b5630] text-white">
      <div className="flex items-center gap-3">
        <Image
          src="/raiz_header.png"
          alt="Logo de Raiz Viva"
          width={256}
          height={256}
          className="w-16 h-16 object-contain"
        />
        <div className="hidden sm:flex flex-col">
          <span className="font-semibold text-sm">Panel Líder Territorial</span>
        </div>
      </div>

      {!isLoginPage && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2"
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