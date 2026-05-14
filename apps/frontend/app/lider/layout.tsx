'use client';

import { usePathname } from 'next/navigation';
import { AprobacionesProvider, useAprobaciones } from '../hooks/useAprobaciones';
import { HeaderLider } from '../components/HeaderLider';
import { Footer } from '../components/Footer';
import { ReactNode } from 'react';

function HeaderWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/lider/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f3e7]">
      <HeaderLider />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function LiderLayout({ children }: { children: React.ReactNode }) {
  return (
    <AprobacionesProvider>
      <HeaderWrapper>{children}</HeaderWrapper>
    </AprobacionesProvider>
  );
}