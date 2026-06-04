// app/actor/events/[eventId]/edit/page.tsx

import { ActorDashboardLayout } from '@/app/views/layouts/ActorDashboardLayout';
import { EditEventWizard } from '@/app/views/components/events/wizard/EditEventWizard';

interface Props {
  params: Promise<{
    eventId: string;
  }>;
}

export const metadata = {
  title: 'Editar evento | Raiz Viva',
};

export default async function EditEventPage({ params }: Props) {
  const { eventId } = await params;

  return (
    <ActorDashboardLayout>
      <EditEventWizard eventId={eventId} />
    </ActorDashboardLayout>
  );
}