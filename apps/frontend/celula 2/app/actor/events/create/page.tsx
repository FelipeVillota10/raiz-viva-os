// app/(actor)/events/create/page.tsx
// Ruta: /actor/events/create 
// Renders el wizard de creación de eventos dentro del layout del actor.
 
import { ActorDashboardLayout } from '@/app/views/layouts/ActorDashboardLayout';
import { CreateEventWizard }    from '@/app/views/components/events/wizard/CreateEventWizard';
 
export const metadata = {
  title: 'Crear evento | Raíz Viva',
};
 
export default function CreateEventPage() {
  return (
    <ActorDashboardLayout>
      <CreateEventWizard />
    </ActorDashboardLayout>
  );
}

