'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LiderAuthGuard } from '@/components/shared/LiderAuthGuard';
import { eventosService } from '@/services/eventosService';
import { Button } from '@/components/shared/Button';
import { Toast } from '@/components/shared/Toast';
import { EventSummaryModal } from '@/components/events/EventSummaryModal';

export default function LiderEventosPage() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({ visible: false, message: '', type: 'success' });
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'en_revision' | 'aprobado' | 'rechazado'>('en_revision');

  const fetchEventos = async () => {
    if (!user?.territorio_id) return;
    try {
      setLoading(true);
      const data = await eventosService.listarEventos(activeTab, user.territorio_id);
      setEventos(data);
    } catch (error) {
      setToast({ visible: true, message: 'Error al cargar los eventos', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, [user?.territorio_id, activeTab]);

  const handleAction = async (e: React.MouseEvent, eventId: string, action: 'aprobar' | 'rechazar') => {
    e.stopPropagation();
    setProcessingId(eventId);
    try {
      if (action === 'aprobar') {
        await eventosService.aprobarEvento(eventId);
        setToast({ visible: true, message: 'Evento aprobado exitosamente', type: 'success' });
      } else {
        await eventosService.rechazarEvento(eventId);
        setToast({ visible: true, message: 'Evento rechazado', type: 'success' });
      }
      // Actualizar la lista removiendo el evento procesado
      setEventos(prev => prev.filter(ev => ev.id_evento !== eventId));
    } catch (error) {
      setToast({ visible: true, message: 'Error al procesar el evento', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const tabs = [
    { label: 'En Revisión', value: 'en_revision' as const },
    { label: 'Aprobados', value: 'aprobado' as const },
    { label: 'Rechazados', value: 'rechazado' as const },
  ];

  return (
    <LiderAuthGuard>
      <div className="px-4 py-8 max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-[#557149] mb-2">Eventos de mi Territorio</h1>
        <p className="text-[#353535] mb-6">
          Gestiona y revisa los eventos creados por los actores de tu territorio.
        </p>

        {/* Subcategorias de filtrado */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
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

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-[#3b5630] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : eventos.length === 0 ? (
          <div className="bg-white border border-[#c9d4be] rounded-xl p-8 text-center text-[#6b7a63]">
            No hay eventos en estado "{tabs.find(t => t.value === activeTab)?.label}" en este momento.
          </div>
        ) : (
          <div className="grid gap-4">
            {eventos.map((evento) => (
              <div 
                key={evento.id_evento} 
                className="bg-white border border-[#c9d4be] rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start shadow-sm cursor-pointer hover:bg-[#f9f3e7] transition-colors"
                onClick={() => setSelectedEventId(evento.id_evento)}
              >
                {evento.imagen ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={evento.imagen} 
                    alt={evento.nombre} 
                    className="w-full md:w-48 h-32 object-cover rounded-lg shrink-0 bg-[#f4ede0]"
                  />
                ) : (
                  <div className="w-full md:w-48 h-32 bg-[#f4ede0] rounded-lg shrink-0 flex items-center justify-center text-[#6b7a63] text-sm">
                    Sin imagen
                  </div>
                )}
                
                <div className="flex-1 flex flex-col h-full w-full">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-[#2c3a26]">{evento.nombre}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                          activeTab === 'en_revision' ? 'bg-yellow-100 text-yellow-800' :
                          activeTab === 'aprobado' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {tabs.find(t => t.value === activeTab)?.label}
                        </span>
                        {evento.id_categoria?.nombre && (
                          <span className="px-2 py-1 bg-[#f4ede0] text-[#6b7a63] text-xs font-medium rounded-md">
                            {evento.id_categoria.nombre}
                          </span>
                        )}
                      </div>
                    </div>
                    {activeTab === 'en_revision' && (
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={processingId === evento.id_evento}
                          onClick={(e) => handleAction(e, evento.id_evento, 'aprobar')}
                        >
                          {processingId === evento.id_evento ? '...' : 'Aprobar'}
                        </Button>
                        <button
                          disabled={processingId === evento.id_evento}
                          onClick={(e) => handleAction(e, evento.id_evento, 'rechazar')}
                          className="px-4 py-2 rounded-full text-sm font-medium transition bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50"
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-[#353535] mt-3 line-clamp-2">
                    {evento.descripcion}
                  </p>
                  
                  <div className="mt-auto pt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#6b7a63]">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      {new Date(evento.fecha_inicio).toLocaleDateString('es-CO')}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      Capacidad: {evento.capacidad}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                      {evento.es_gratuito ? 'Gratuito' : `Costo: $${evento.costo_evento}`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedEventId && (
        <EventSummaryModal
          visible={true}
          onClose={() => setSelectedEventId(null)}
          eventId={selectedEventId}
          confirmText="Cerrar"
        />
      )}

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </LiderAuthGuard>
  );
}
