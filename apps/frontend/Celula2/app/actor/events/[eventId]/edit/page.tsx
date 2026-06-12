// app/actor/events/[eventId]/edit/page.tsx

import { ActorDashboardLayout } from '@/app/views/layouts/ActorDashboardLayout';
import { EditEventWizard }      from '@/app/views/components/events/wizard/EditEventWizard';

interface Props {
  params: { eventId: string };
}

export default function EditEventPage({ params }: Props) {
  return (
    <ActorDashboardLayout>
      <EditEventWizard eventId={params.eventId} />
    </ActorDashboardLayout>
  );
}