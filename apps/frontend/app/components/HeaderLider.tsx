'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { UserIcon } from './ui/Icons';

interface HeaderLiderProps {
  showNotification?: boolean;
  pendingCount?: number;
}

export function HeaderLider({ showNotification = false, pendingCount = 0 }: HeaderLiderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('access_token=')) {
        document.cookie = 'access_token=; path=/; max-age=0';
      }
      if (cookie.startsWith('refresh_token=')) {
        document.cookie = 'refresh_token=; path=/; max-age=0';
      }
    }
    logout();
    router.push('/lider/login');
  };

  return (
    <header className="flex justify-between items-center px-4 py-3 h-16 bg-[#3b5630] text-white shadow-md">
      <div className="flex items-center gap-3">
        <Image src="/raiz_header.png" alt="Logo" width={80} height={80} className="w-44 h-44 object-contain" />
      </div>

      <div className="flex items-center gap-4">
        {showNotification && pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
            <div className="relative">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="absolute -top-1 -right-1 bg-[#f59e0b] text-black text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            </div>
            <span className="text-sm font-medium">{pendingCount} pendientes</span>
          </div>
        )}

        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
          <UserIcon size={18} />
          <span className="text-sm font-medium">{user?.nombre_completo || 'Líder Territorial'}</span>
        </div>

        <button
          onClick={handleLogout}
          className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium transition cursor-pointer"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}