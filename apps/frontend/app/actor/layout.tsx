'use client';

import React from 'react';
import { AppHeader } from '@/components/shared/AppHeader';
import { Footer } from '@/components/shared/Footer';
import { ActorAuthGuard } from '@/components/shared/ActorAuthGuard';

export default function ActorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ActorAuthGuard>
      <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
        <AppHeader role="public" />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </div>
    </ActorAuthGuard>
  );
}
