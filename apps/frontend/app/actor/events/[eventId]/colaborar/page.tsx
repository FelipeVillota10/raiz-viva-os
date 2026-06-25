'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Actor {
  id_cliente: number;
  nombre: string;
}

interface ServiceItem {
  id_servicio: number;
  nombre: string;
}

interface CollaboratorInput {
  id_detalle?: number;
  id_cliente?: number;
  id_colaborador: number;
  porcentaje: string; // lo manejamos como string para el input
  servicios: ServiceItem[];
  isExisting?: boolean;
  statusText?: string;
}

export default function ColaborarEventPage() {
  const router = useRouter();
  const { eventId } = useParams() as { eventId: string };
  const { user } = useAuth();

  const [actores, setActores] = useState<Actor[]>([]);
  const [eventData, setEventData] = useState<any>(null);
  
  const [colaboradores, setColaboradores] = useState<CollaboratorInput[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 1. Cargar el evento y los actores del mismo territorio
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Obtener evento
        const resEvento = await fetch(`${API_BASE}/api/eventos/${eventId}/`);
        if (!resEvento.ok) throw new Error('Error al cargar evento');
        const evento = await resEvento.json();
        setEventData(evento);

        // Obtener clientes actores (esto asume que el backend retorna todos, pero idealmente filtrados por territorio_id)
        // Por ahora cargamos todos y los filtramos en frontend si la API no lo soporta
        const resActores = await fetch(`${API_BASE}/api/clientes/`);
        if (!resActores.ok) throw new Error('Error al cargar actores');
        const allClientes = await resActores.json();
        
        // Filtrar clientes que sean actores y (opcional) del mismo territorio del evento
        const posiblesActores = allClientes.filter(
          (c: any) => c.es_actor === true && c.id_cliente !== user?.id
        );
        setActores(posiblesActores);
        
        // Obtener detalles (invitaciones) previas y estados
        const [resDetalles, resEstados] = await Promise.all([
          fetch(`${API_BASE}/api/detalles_eventos/?id_evento=${eventId}`),
          fetch(`${API_BASE}/api/estados/`)
        ]);

        if (resDetalles.ok && resEstados.ok) {
          const detallesPrevios = await resDetalles.json();
          const estados = await resEstados.json();
          
          const estadoRechazado = estados.find((e: any) => e.nombre_estado.toLowerCase() === 'rechazado');
          const idRechazado = estadoRechazado ? estadoRechazado.id : -1;
          
          const estadoAprobado = estados.find((e: any) => e.nombre_estado.toLowerCase() === 'aprobado');
          const idAprobado = estadoAprobado ? estadoAprobado.id : -1;
          
          const estadoInactivo = estados.find((e: any) => e.nombre_estado.toLowerCase() === 'inactivo');
          const idInactivo = estadoInactivo ? estadoInactivo.id : -1;

          // Filtrar las rechazadas e inactivas para que no aparezcan y suelten el porcentaje
          const detallesValidos = detallesPrevios.filter((d: any) => d.id_estado !== idRechazado && d.id_estado !== idInactivo);

          const colaboradoresIniciales = await Promise.all(detallesValidos.map(async (detalle: any) => {
            let servicios: ServiceItem[] = [];
            try {
              const resServ = await fetch(`${API_BASE}/api/clientes/${detalle.id_colaboradores}/servicios/`);
              if (resServ.ok) {
                const sData = await resServ.json();
                servicios = sData.results || sData || [];
              }
            } catch (e) {}
            return {
              id_detalle: detalle.id_detalle,
              id_colaborador: detalle.id_colaboradores,
              porcentaje: detalle.distribucion_pago ? detalle.distribucion_pago.toString() : '0',
              servicios,
              isExisting: true,
              statusText: detalle.id_estado === idAprobado ? 'Aceptado' : 'Ya Invitado'
            };
          }));
          setColaboradores(colaboradoresIniciales);
        }
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [eventId, user?.id]);

  const handleCancelar = async (id_detalle: number) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta invitación?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/detalles_eventos/${id_detalle}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'cancelar' })
      });
      if (!res.ok) throw new Error('Error al cancelar la invitación');
      setColaboradores(prev => prev.filter(c => c.id_detalle !== id_detalle));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const totalPorcentaje = colaboradores.reduce((acc, curr) => acc + (parseFloat(curr.porcentaje) || 0), 0);
  const remaining = 100 - totalPorcentaje;

  const handleAddCollaborator = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const actorId = parseInt(e.target.value);
    if (!actorId) return;

    if (colaboradores.some(c => c.id_colaborador === actorId)) return;

    let servicios: ServiceItem[] = [];
    try {
      const resServicios = await fetch(`${API_BASE}/api/clientes/${actorId}/servicios/`);
      if (resServicios.ok) {
        const data = await resServicios.json();
        servicios = data.results || data || [];
      }
    } catch (e) {
      console.error("Error al obtener servicios", e);
    }

    setColaboradores([...colaboradores, { id_colaborador: actorId, porcentaje: '', servicios }]);
    e.target.value = "";
  };

  const updatePorcentaje = (index: number, value: string) => {
    const newColaboradores = [...colaboradores];
    newColaboradores[index].porcentaje = value;
    setColaboradores(newColaboradores);
  };

  const removeCollaborator = (index: number) => {
    const newColaboradores = [...colaboradores];
    newColaboradores.splice(index, 1);
    setColaboradores(newColaboradores);
  };

  const handleInvitar = async () => {
    if (colaboradores.length === 0) {
      setError('Debes agregar al menos un colaborador');
      return;
    }
    if (remaining < 0) {
      setError(`La suma de porcentajes no puede superar el 100%. Te has excedido por: ${Math.abs(remaining).toFixed(2)}%`);
      return;
    }

    const hasZeroPercentage = colaboradores.some(c => !c.isExisting && (parseFloat(c.porcentaje) <= 0 || !c.porcentaje));
    if (hasZeroPercentage) {
      setError('No puedes enviar invitaciones con un porcentaje de 0%.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const nuevosColaboradores = colaboradores.filter(c => !c.isExisting);
      
      if (nuevosColaboradores.length === 0) {
        // If they just opened it and clicked save without changes
        router.push('/actor/events');
        return;
      }

      const payload = nuevosColaboradores.map(c => ({
        id_evento: parseInt(eventId),
        distribucion_pago: parseFloat(c.porcentaje),
        id_colaboradores: c.id_colaborador
      }));

      const res = await fetch(`${API_BASE}/api/detalles_eventos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar las invitaciones');
      }

      router.push('/actor/events');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#557149]"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 mt-10 bg-gradient-to-br from-white to-[#fdfbf7] rounded-3xl shadow-xl shadow-[#8c9a80]/10 border border-[#e8efe3]">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 border-b border-[#e8efe3] pb-6">
        <div>
          <span className="text-xs font-bold tracking-widest text-[#8c9a80] uppercase mb-1 block">Gestión de Evento</span>
          <h1 className="text-3xl font-extrabold text-[#2c3a26]">Colaborar en <span className="text-[#557149]">{eventData?.nombre}</span></h1>
        </div>
        <div className="bg-[#f4ede0] text-[#557149] px-5 py-2.5 rounded-2xl font-bold flex items-center justify-center shadow-inner">
          Total del evento: 100%
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50/80 backdrop-blur text-red-600 p-4 rounded-2xl mb-8 text-sm font-medium border border-red-100 flex items-center gap-3 animate-pulse">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
          {error}
        </div>
      )}

      {/* Selector de actor */}
      <div className="bg-white p-6 rounded-2xl border border-[#e8efe3] shadow-sm mb-10">
        <label className="block text-sm font-bold text-[#557149] mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          Añadir Colaborador (Actor del Territorio)
        </label>
        <div className="relative">
          <select 
            className="w-full md:w-1/2 px-5 py-3.5 bg-[#fdfbf7] border border-[#d3ddca] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8c9a80]/30 focus:border-[#557149] text-[#2c3a26] font-medium transition-all appearance-none cursor-pointer"
            onChange={handleAddCollaborator}
            defaultValue=""
          >
            <option value="" disabled>Selecciona un actor para invitar...</option>
            {actores.map(actor => (
              <option key={actor.id_cliente} value={actor.id_cliente}>
                {actor.nombre}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 md:right-1/2 flex items-center px-4 text-[#8c9a80]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <div className="space-y-6 mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-[#f4ede0] to-[#e8efe3] p-5 rounded-2xl border border-[#d3ddca]">
          <span className="font-bold text-[#2c3a26]">Porcentaje restante por asignar:</span>
          <div className="mt-2 sm:mt-0 flex items-center">
            <span className={`text-2xl font-black tracking-tight ${remaining === 0 ? 'text-[#557149]' : remaining < 0 ? 'text-red-500' : 'text-[#8c9a80]'}`}>
              {remaining.toFixed(2)}%
            </span>
            {remaining === 0 && (
              <svg className="w-6 h-6 text-[#557149] ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            )}
          </div>
        </div>

        {colaboradores.map((colab, index) => {
          const actorInfo = actores.find(a => a.id_cliente === colab.id_colaborador);
          return (
            <div key={colab.id_colaborador} className="group bg-white hover:bg-[#fdfbf7] border border-[#e8efe3] hover:border-[#8c9a80] rounded-2xl p-5 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f4ede0] flex items-center justify-center text-[#557149] font-bold text-lg">
                    {actorInfo?.nombre.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-bold text-lg text-[#2c3a26]">{actorInfo?.nombre}</p>
                </div>
                
                <div className="mt-3 pl-13">
                  <span className="text-xs font-bold text-[#8c9a80] uppercase tracking-wider block mb-1">Servicios que provee:</span>
                  <div className="flex flex-wrap gap-2">
                    {colab.servicios && colab.servicios.length > 0 
                      ? colab.servicios.map((s, i) => (
                          <span key={i} className="bg-[#e8efe3] text-[#4a633f] text-xs font-medium px-2.5 py-1 rounded-md">
                            {s.nombre}
                          </span>
                        )) 
                      : <span className="text-gray-400 text-xs italic">Ninguno registrado</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-[#8c9a80] uppercase mb-1">Participación</label>
                  <div className={`flex items-center bg-gray-50 border border-[#d3ddca] rounded-xl focus-within:ring-2 focus-within:ring-[#557149] focus-within:border-[#557149] overflow-hidden transition-all ${colab.isExisting ? 'opacity-60 bg-gray-100' : ''}`}>
                    <input
                      type="number"
                      step="0.01"
                      value={colab.porcentaje}
                      onChange={(e) => updatePorcentaje(index, e.target.value)}
                      placeholder="0.00"
                      disabled={colab.isExisting}
                      className="w-24 px-4 py-2.5 bg-transparent outline-none text-right font-bold text-[#2c3a26]"
                    />
                    <div className="px-4 py-2.5 bg-[#f4ede0] text-[#557149] font-bold border-l border-[#d3ddca]">
                      %
                    </div>
                  </div>
                </div>
                
                {!colab.isExisting ? (
                  <button
                    onClick={() => removeCollaborator(index)}
                    className="mt-5 text-[#8c9a80] hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-colors self-end md:self-center"
                    title="Eliminar colaborador"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 self-end md:self-center items-end mt-4 md:mt-0">
                    <div className={`p-2.5 text-xs font-bold rounded-xl ${colab.statusText === 'Aceptado' ? 'text-green-700 bg-green-100' : 'text-[#557149] bg-[#e8efe3]'}`}>
                      {colab.statusText || 'Ya Invitado'}
                    </div>
                    {colab.statusText !== 'Aceptado' && (
                      <button 
                        onClick={() => handleCancelar(colab.id_detalle!)}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 underline cursor-pointer"
                        title="Cancelar esta invitación"
                      >
                        Cancelar invitación
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {colaboradores.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#8c9a80]">
            <svg className="w-12 h-12 text-[#d3ddca] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            <p className="text-[#8c9a80] font-medium">Aún no has agregado colaboradores a este evento.</p>
            <p className="text-[#8c9a80] text-sm mt-1">Usa el menú de arriba para empezar.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6">
        <button
          onClick={() => router.push('/actor/events')}
          className="px-8 py-3.5 border-2 border-[#d3ddca] text-[#557149] font-bold rounded-xl hover:bg-[#f4ede0] hover:border-[#c9d4be] transition-all w-full sm:w-auto"
        >
          Cancelar
        </button>
        <button
          onClick={handleInvitar}
          disabled={isSubmitting || colaboradores.length === 0 || remaining < 0 || colaboradores.some(c => !c.isExisting && (parseFloat(c.porcentaje) <= 0 || !c.porcentaje))}
          className="px-8 py-3.5 bg-[#557149] hover:bg-[#3b5630] text-white font-bold rounded-xl shadow-lg shadow-[#557149]/30 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed w-full sm:w-auto flex justify-center items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Enviando invitaciones...
            </>
          ) : 'Enviar Invitaciones'}
        </button>
      </div>
    </div>
  );
}
