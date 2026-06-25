'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { EventListItem } from '@/hooks/events/useEventListViewModel';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Collaborator {
  id_colaborador: number;
  nombre: string;
  porcentaje: number;
  estado: string;
  servicios?: string[];
}

interface PublishConfirmModalProps {
  visible: boolean;
  event: EventListItem;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function PublishConfirmModal({ visible, event, onConfirm, onClose }: PublishConfirmModalProps) {
  const { user } = useAuth();
  const [colaboradores, setColaboradores] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    async function fetchData() {
      try {
        setLoading(true);
        // Obtener los detalles_eventos y clientes (para los nombres)
        const [resDetalles, resClientes, resEstados] = await Promise.all([
          fetch(`${API_BASE}/api/detalles_eventos/?id_evento=${event.id}`),
          fetch(`${API_BASE}/api/clientes/`),
          fetch(`${API_BASE}/api/estados/`)
        ]);

        if (resDetalles.ok && resClientes.ok && resEstados.ok) {
          const detalles = await resDetalles.json();
          const clientes = await resClientes.json();
          const estados = await resEstados.json();
          
          const estadoRechazado = estados.find((e: any) => e.nombre_estado.toLowerCase() === 'rechazado');
          const idRechazado = estadoRechazado ? estadoRechazado.id : -1;
          const estadoInactivo = estados.find((e: any) => e.nombre_estado.toLowerCase() === 'inactivo');
          const idInactivo = estadoInactivo ? estadoInactivo.id : -1;

          const detallesValidos = detalles.filter((d: any) => d.id_estado !== idRechazado && d.id_estado !== idInactivo);
          
          const mappedColaboradores = await Promise.all(detallesValidos.map(async (d: any) => {
            const cInfo = clientes.find((c: any) => c.id_cliente === d.id_colaboradores);
            const eInfo = estados.find((e: any) => e.id === d.id_estado);
            
            let servicios: string[] = [];
            try {
              const resServ = await fetch(`${API_BASE}/api/clientes/${d.id_colaboradores}/servicios/`);
              if (resServ.ok) {
                const sData = await resServ.json();
                const servArray = sData.results || sData || [];
                servicios = servArray.map((s: any) => s.nombre_servicio || 'Servicio');
              }
            } catch (e) {}

            return {
              id_colaborador: d.id_colaboradores,
              nombre: cInfo ? cInfo.nombre : `Actor #${d.id_colaboradores}`,
              porcentaje: parseFloat(d.distribucion_pago) || 0,
              estado: eInfo ? eInfo.nombre_estado : 'Desconocido',
              servicios
            };
          }));
          setColaboradores(mappedColaboradores);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [visible, event.id]);

  if (!visible) return null;

  const totalColaboradores = colaboradores.reduce((acc, curr) => acc + curr.porcentaje, 0);
  const restante = Math.max(0, 100 - totalColaboradores);

  const priceLabel = event.pricingType === 'free'
    ? 'Gratuito'
    : `${event.currency} ${event.price.toLocaleString('es-CO')}`;

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      if (restante > 0 && user?.id) {
        // Enviar el resto al actor principal
        const res = await fetch(`${API_BASE}/api/detalles_eventos/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_evento: parseInt(event.id),
            distribucion_pago: restante,
            id_colaboradores: user.id
          })
        });
        
        // Parcheamos el estado a aprobado luego de crearlo para asegurar el requerimiento
        if (res.ok) {
           const newDetalle = await res.json();
           await fetch(`${API_BASE}/api/detalles_eventos/${newDetalle.id_detalle}/`, {
             method: 'PATCH',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ accion: 'aprobar' })
           });
        }
      }
      
      await onConfirm();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Hubo un error al publicar el evento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-[#557149] p-6 text-white text-center shrink-0">
          <h2 className="text-2xl font-bold">Publicar Evento</h2>
          <p className="opacity-90 mt-1">Revisa los detalles antes de que tu evento sea visible para todos.</p>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#557149]"></div>
            </div>
          ) : (
            <>
              {/* Resumen del evento */}
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                {event.image ? (
                  <img src={event.image} alt={event.name} className="w-full sm:w-40 h-40 object-cover rounded-2xl shadow-sm" />
                ) : (
                  <div className="w-full sm:w-40 h-40 bg-[#f4ede0] rounded-2xl flex items-center justify-center text-[#8c9a80]">Sin imagen</div>
                )}
                
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-bold text-[#2c3a26]">{event.name}</h3>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mt-3">
                    <div><span className="text-[#8c9a80] font-bold">Capacidad:</span> {event.capacity} personas</div>
                    <div><span className="text-[#8c9a80] font-bold">Precio:</span> {priceLabel}</div>
                    <div><span className="text-[#8c9a80] font-bold">Categoría:</span> {event.category}</div>
                    <div><span className="text-[#8c9a80] font-bold">Fecha:</span> {(() => {
                      try {
                        const d = new Date(event.startDate);
                        return isNaN(d.getTime()) ? 'No definida' : d.toLocaleDateString('es-CO');
                      } catch {
                        return 'Inválida';
                      }
                    })()}</div>
                  </div>
                </div>
              </div>

              {/* Distrubición */}
              <div className="bg-[#fdfbf7] border border-[#d3ddca] rounded-2xl p-5 mb-6">
                <h4 className="font-bold text-[#2c3a26] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#557149]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  Distribución de Ganancias
                </h4>
                
                {colaboradores.length > 0 ? (
                  <ul className="space-y-3 mb-4">
                    {colaboradores.map(c => (
                      <li key={c.id_colaborador} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm border-b border-[#e8efe3] pb-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-[#4a633f]">{c.nombre} <span className="text-xs text-gray-400">({c.estado})</span></span>
                          {c.servicios && c.servicios.length > 0 && (
                            <span className="text-xs text-[#8c9a80] mt-0.5">{c.servicios.join(', ')}</span>
                          )}
                        </div>
                        <span className="font-bold text-[#2c3a26] mt-1 sm:mt-0">{c.porcentaje}%</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 mb-4 italic">No tienes colaboradores asignados.</p>
                )}
                
                {restante > 0 && (
                  <div className="bg-[#e8efe3] p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#557149] block">Tu asignación (Actor Principal)</span>
                      <span className="text-xs text-[#6b7a63]">Asignación automática del saldo restante.</span>
                    </div>
                    <span className="text-lg font-black text-[#557149]">{restante.toFixed(2)}%</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl font-bold text-[#6b7a63] hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handlePublish}
            disabled={loading || isSubmitting}
            className="px-6 py-2.5 rounded-xl font-bold bg-[#557149] hover:bg-[#3b5630] text-white transition-colors disabled:opacity-50 shadow-md flex items-center gap-2"
          >
            {isSubmitting ? 'Publicando...' : 'Confirmar Publicación'}
          </button>
        </div>
      </div>
    </div>
  );
}