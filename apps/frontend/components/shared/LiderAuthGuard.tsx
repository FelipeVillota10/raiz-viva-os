'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  children: React.ReactNode;
}

export function LiderAuthGuard({ children }: Props) {
  const { isAuthenticated, isLider, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/lider/login'); 
      } else if (!isLider) {
        router.push('/');
      }
    }
  }, [loading, isAuthenticated, isLider, router]);

  if (loading || !isAuthenticated || !isLider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-4">
        <div className="w-8 h-8 border-4 border-[#3b5630] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#3b5630] font-medium">Verificando permisos de líder...</p>
      </div>
    );
  }

  return <>{children}</>;
}
