'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { AppHeader } from '@/components/shared/AppHeader';
import { Footer } from '@/components/shared/Footer';
import { TuristaEventModal } from '@/components/events/TuristaEventModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Evento {
  id_evento: number;
  nombre: string;
  descripcion: string;
  imagen: string | null;
  fecha_inicio: string;
  costo_evento: string | number;
  es_gratuito: boolean;
  id_territorio: number;
  id_categoria?: { nombre: string };
  capacidad: number;
}

interface Territorio {
  id_territorio: number;
  nombre_territorio: string;
}

export default function TuristaEventosPage() {
  const { isAuthenticated } = useAuth();

  const [events, setEvents] = useState<Evento[]>([]);
  const [territorios, setTerritorios] = useState<Territorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [search, setSearch] = useState('');
  const [priceMax, setPriceMax] = useState<number | ''>('');
  const [territorioId, setTerritorioId] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isFree, setIsFree] = useState<boolean>(false);

  // Modal State
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resE, resT] = await Promise.all([
          fetch(`${API_BASE}/api/eventos/`),
          fetch(`${API_BASE}/api/territorios/`)
        ]);
        if (!resE.ok) throw new Error('Error al cargar eventos');
        
        const dataE = await resE.json();
        const dataT = resT.ok ? await resT.json() : [];

        const evs = (dataE.results || dataE).filter((e: any) => 
          e.id_estado === 12 || (e.id_estado && e.id_estado.id === 12)
        );
        
        setEvents(evs);
        setTerritorios(dataT.results || dataT);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);



  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      // Búsqueda por nombre
      if (search && !e.nombre.toLowerCase().includes(search.toLowerCase())) return false;
      // Filtro de territorio
      if (territorioId && e.id_territorio.toString() !== territorioId) return false;
      // Filtro de gratutidad
      if (isFree && !e.es_gratuito && Number(e.costo_evento) > 0) return false;
      // Filtro de precio máximo
      if (priceMax !== '' && Number(e.costo_evento) > Number(priceMax)) return false;
      // Filtro de fecha
      if (dateStr) {
        const eDate = e.fecha_inicio ? e.fecha_inicio.split('T')[0] : '';
        if (eDate !== dateStr) return false;
      }
      return true;
    });
  }, [events, search, priceMax, territorioId, dateStr, isFree]);

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Fecha no definida';
      return d.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col">
      <AppHeader role="public" />
      
      <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 sm:p-6 gap-6 pt-24">
        {/* Panel de Filtros */}
        <aside className="w-full md:w-72 shrink-0 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="bg-white rounded-2xl shadow-sm border border-[#e8efe3] p-5 sticky top-24">
              <h2 className="text-lg font-bold text-[#2c3a26] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#557149]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                Filtros
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#4a633f] mb-1">Buscar</label>
                  <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nombre del evento..."
                    className="w-full px-3 py-2 border border-[#d3ddca] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#557149]/50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4a633f] mb-1">Territorio</label>
                  <select 
                    value={territorioId}
                    onChange={(e) => setTerritorioId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d3ddca] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#557149]/50 text-sm bg-white"
                  >
                    <option value="">Todos los territorios</option>
                    {territorios.map(t => (
                      <option key={t.id_territorio} value={t.id_territorio}>{t.nombre_territorio}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4a633f] mb-1">Fecha exacta</label>
                  <input 
                    type="date" 
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d3ddca] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#557149]/50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4a633f] mb-1">Precio máximo (COP)</label>
                  <input 
                    type="number" 
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Cualquier precio"
                    className="w-full px-3 py-2 border border-[#d3ddca] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#557149]/50 text-sm"
                    disabled={isFree}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="isFree"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="w-4 h-4 text-[#557149] focus:ring-[#557149] border-[#d3ddca] rounded"
                  />
                  <label htmlFor="isFree" className="text-sm font-medium text-[#4a633f] cursor-pointer">
                    Solo eventos gratuitos
                  </label>
                </div>

                <button 
                  onClick={() => {
                    setSearch('');
                    setPriceMax('');
                    setTerritorioId('');
                    setDateStr('');
                    setIsFree(false);
                  }}
                  className="w-full py-2 mt-4 text-sm text-[#8c9a80] hover:text-[#557149] hover:bg-[#f4ede0] rounded-lg transition-colors font-medium"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </aside>

        {/* Lista de Eventos / Tickets */}
        <section className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-[#2c3a26]">
              Explora la Aventura
            </h1>
            <p className="text-[#6b7a63] mt-1">
              Encuentra los mejores eventos publicados y prepárate para vivir algo único.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#557149]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
              {error}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#8c9a80] p-12 text-center">
              <span className="text-4xl mb-3 block">🍃</span>
              <h3 className="text-lg font-bold text-[#4a633f] mb-1">No hay eventos disponibles</h3>
              <p className="text-[#8c9a80] text-sm">Intenta ajustar los filtros para encontrar lo que buscas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
              {filteredEvents.map(event => {
                const territorio = territorios.find(t => t.id_territorio === event.id_territorio);
                return (
                  <div key={event.id_evento} className="bg-white rounded-2xl overflow-hidden border border-[#e8efe3] shadow-sm hover:shadow-lg transition-shadow group flex flex-col">
                    <div className="h-48 bg-gray-200 relative overflow-hidden shrink-0">
                      {event.imagen ? (
                        <Image src={event.imagen} alt={event.nombre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-[#557149] to-[#8c9a80] flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-bold opacity-50 text-xl tracking-widest uppercase">Raíz Viva</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-[#2c3a26] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {event.id_categoria?.nombre || 'General'}
                      </div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-extrabold text-xl text-[#2c3a26] line-clamp-1">{event.nombre}</h3>
                      </div>
                      
                      <p className="text-sm text-[#6b7a63] line-clamp-2 mb-4 flex-1">
                        {event.descripcion || 'Sin descripción disponible.'}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-xs text-[#4a633f] gap-2">
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          <span className="truncate">{territorio?.nombre_territorio || 'Territorio desconocido'}</span>
                        </div>
                        <div className="flex items-center text-xs text-[#4a633f] gap-2">
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          <span>{formatDate(event.fecha_inicio)}</span>
                        </div>
                        <div className="flex items-center text-xs text-[#4a633f] gap-2">
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                          <span>Cupos: {event.capacidad} personas</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#e8efe3] flex items-center justify-between mt-auto">
                        <span className="font-black text-lg text-[#557149]">
                          {event.es_gratuito || Number(event.costo_evento) === 0 
                            ? 'Gratis' 
                            : `$${Number(event.costo_evento).toLocaleString('es-CO')} COP`}
                        </span>
                        <button 
                          onClick={() => {
                            setSelectedEvent(event);
                          }}
                          className="px-4 py-1.5 bg-[#f4ede0] hover:bg-[#557149] text-[#557149] hover:text-white text-sm font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Ver más
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
      
      <TuristaEventModal 
        visible={!!selectedEvent}
        event={selectedEvent}
        nombreTerritorio={selectedEvent ? (territorios.find(t => t.id_territorio === selectedEvent.id_territorio)?.nombre_territorio || 'Territorio') : 'Territorio'}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
