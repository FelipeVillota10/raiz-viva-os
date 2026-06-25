// app/actor/events/page.tsx
// Ruta: /actor/events — lista de eventos del actor
'use client';
 
import React, { useState, useMemo } from 'react';
import { EventListHeader }      from '@/components/events/EventListHeader';
import { EventCard }            from '@/components/events/EventCard';
import { useEventListViewModel }         from '@/hooks/events/useEventListViewModel';
 
type EventFilterTab = 'todos' | 'Borrador' | 'en_revisión' | 'aprobado' | 'rechazado' | 'inactivo';

import { useAuth } from '@/hooks/useAuth';

export default function EventsPage() {
  const { user } = useAuth();
  const {
    events,
    isLoading,
    error,
    deactivateEvent,
    cancelSubmit,
    submitEvent,
  } = useEventListViewModel(user?.id);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<EventFilterTab>('todos');
 
  const filtered = useMemo(() =>
    events.filter((e) => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (activeTab === 'todos') return true;
      return e.status.toLowerCase() === activeTab.toLowerCase();
    }),
    [events, search, activeTab]
  );

  const tabs: { label: string; value: EventFilterTab }[] = [
    { label: 'Todos', value: 'todos' },
    { label: 'Borrador', value: 'Borrador' },
    { label: 'En Revisión', value: 'en_revisión' },
    { label: 'Aprobados', value: 'aprobado' },
    { label: 'Rechazados', value: 'rechazado' },
    { label: 'Inactivos', value: 'inactivo' },
  ];
 
  return (
    <div className="min-h-screen bg-[#F4F1EA]">
      <EventListHeader
        search={search}
        onSearch={setSearch}
        total={filtered.length}
      />

      <div className="px-4 py-4 flex flex-col gap-4 max-w-4xl mx-auto">
        {/* Subcategorias de filtrado */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? 'bg-[#557149] text-white'
                  : 'bg-white border border-[#c9d4be] text-[#6b7a63] hover:border-[#8c9a80]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

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
              {search || activeTab !== 'todos' ? 'No se encontraron eventos con esos filtros.' : 'Aun no tienes eventos creados.'}
            </p>
          </div>
        )}

        {filtered.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onDeactivate={deactivateEvent}
            onCancelSubmit={cancelSubmit}
            onSubmitEvent={submitEvent}
          />
        ))}
      </div>
    </div>
  );
}
 