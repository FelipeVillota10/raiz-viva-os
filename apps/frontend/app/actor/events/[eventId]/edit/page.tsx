// app/actor/events/[eventId]/edit/page.tsx

import { ActorDashboardLayout } from '@/components/layouts/ActorDashboardLayout';
import { EditEventWizard }      from '@/components/EventWizard/EditEventWizard';

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function EditEventPage({ params }: Props) {
  const { eventId } = await params;

  return (
    <ActorDashboardLayout>
      <EditEventWizard eventId={eventId} />
    </ActorDashboardLayout>
  );
}