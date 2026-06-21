// app/(actor)/events/layout.tsx
// Layout compartido de toda la sección /actor/events/*
// Envuelve con ActorDashboardLayout para que todas las sub-rutas tengan header y footer.
 
import React from 'react';
import { ActorDashboardLayout } from '@/components/layouts/ActorDashboardLayout';
import { ActorAuthGuard } from '@/components/shared/ActorAuthGuard';

interface Props {
  children: React.ReactNode;
}
 
export default function ActorEventsLayout({ children }: Props) {
  return (
    <ActorAuthGuard>
      <ActorDashboardLayout>
        {children}
      </ActorDashboardLayout>
    </ActorAuthGuard>
  );
}