// app/actor/events/page.tsx
// Ruta: /actor/events — lista de eventos del actor
'use client';
 
import React, { useState, useMemo } from 'react';
import { ActorDashboardLayout } from '@/app/views/layouts/ActorDashboardLayout';
import { EventListHeader }      from '@/app/views/components/events/EventListHeader';
import { EventCard }            from '@/app/views/components/events/EventCard';
import { useEventList }         from '@/app/viewmodels/events/useEventList';
 
export default function EventsPage() {
  const { events, isLoading, error, deactivateEvent } = useEventList();
  const [search, setSearch] = useState('');
 
  const filtered = useMemo(() =>
    events.filter((e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
    ),
    [events, search]
  );
 
  return (
    <ActorDashboardLayout>
      <div className="min-h-screen bg-[#f9f3e7]">
        <EventListHeader
          search={search}
          onSearch={setSearch}
          total={filtered.length}
        />
 
        <div className="px-4 py-4 flex flex-col gap-3">
          {isLoading && (
            <p className="text-sm text-[#6b7a63] text-center py-8">
              Cargando eventos...
            </p>
          )}
 
          {error && (
            <p className="text-sm text-red-500 text-center py-8">{error}</p>
          )}
 
          {!isLoading && !error && filtered.length === 0 && (
            <div className="text-center py-12 flex flex-col items-center gap-3">
              <span className="text-4xl">🌱</span>
              <p className="text-sm text-[#6b7a63]">
                {search ? 'No se encontraron eventos con ese nombre.' : 'Aun no tienes eventos creados.'}
              </p>
            </div>
          )}
 
          {filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onDeactivate={deactivateEvent}
            />
          ))}
        </div>
      </div>
    </ActorDashboardLayout>
  );
}
 