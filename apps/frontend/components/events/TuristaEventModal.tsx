'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import QRCode from 'react-qr-code';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ServiceItem {
  id: number;
  nombre: string;
}

interface CollaboratorInfo {
  id_colaborador: number;
  nombre: string;
  correo: string;
  servicios: ServiceItem[];
}

interface TuristaEventModalProps {
  visible: boolean;
  event: any | null;
  nombreTerritorio?: string;
  onClose: () => void;
}

export function TuristaEventModal({ visible, event, nombreTerritorio, onClose }: TuristaEventModalProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  const [colaboradores, setColaboradores] = useState<CollaboratorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<any>(null);
  const [reserving, setReserving] = useState(false);
  
  const [step, setStep] = useState<'details' | 'quantity'>('details');
  const [cantidad, setCantidad] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchColaboradores() {
      if (!visible || !event) return;
      setStep('details');
      setCantidad(1);
      setErrorMsg('');
      try {
        setLoading(true);
        const [resDetalles, resClientes] = await Promise.all([
          fetch(`${API_BASE}/api/detalles_eventos/?evento=${event.id_evento}`),
          fetch(`${API_BASE}/api/clientes/`)
        ]);

        if (!resDetalles.ok || !resClientes.ok) {
          throw new Error('Error al cargar colaboradores');
        }

        const detalles = await resDetalles.json();
        const clientes = await resClientes.json();

        // Solo actores aprobados participan activamente en el evento (id_estado = 8)
        // Obtenemos los estados para saber cuál es el id_estado 'aprobado'
        const resEstados = await fetch(`${API_BASE}/api/estados/`);
        let idAprobado = 8; // fallback
        if (resEstados.ok) {
          const estados = await resEstados.json();
          const estadoAprobado = estados.find((e: any) => e.nombre_estado.toLowerCase() === 'aprobado');
          if (estadoAprobado) idAprobado = estadoAprobado.id;
        }

        const detallesDelEvento = detalles.filter((d: any) => d.id_evento === event.id_evento);
        const detallesAprobados = detallesDelEvento.filter((d: any) => d.id_estado === idAprobado);

        const mapped = await Promise.all(detallesAprobados.map(async (d: any) => {
          const cliente = clientes.find((c: any) => c.id_cliente === d.id_colaboradores);
          let servicios: ServiceItem[] = [];
          
          try {
            const resServ = await fetch(`${API_BASE}/api/clientes/${d.id_colaboradores}/servicios/`);
            if (resServ.ok) {
              const sData = await resServ.json();
              servicios = sData.results || sData || [];
            }
          } catch (e) {
            console.error(e);
          }

          return {
            id_colaborador: d.id_colaboradores,
            nombre: cliente ? cliente.nombre : `Actor #${d.id_colaboradores}`,
            correo: cliente ? cliente.correo_electronico : '',
            servicios
          };
        }));

        setColaboradores(mapped);
      } catch (err) {
        console.error('Error fetching collaborators:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchColaboradores();
  }, [visible, event]);

  const isFree = event?.es_gratuito || Number(event?.costo_evento) === 0;

  const handleReservarClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isFree) {
      generarTiquetesGratis();
    } else {
      setStep('quantity');
    }
  };

  const generarTiquetesGratis = async () => {
    try {
      setReserving(true);
      const clientId = user?.id || user?.id_cliente;
      if (!clientId) throw new Error("No se pudo identificar tu usuario. Inicia sesión nuevamente.");

      const res = await fetch(`${API_BASE}/api/tiquetes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'generar', id_cliente: clientId, id_evento: event?.id_evento })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al generar la reserva');
      }

      const data = await res.json();
      setTicket({ ...data, isFree: true });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReserving(false);
    }
  };

  const handlePagar = async () => {
    setErrorMsg('');
    if (cantidad <= 0) {
      setErrorMsg("La cantidad debe ser mayor a 0");
      return;
    }
    if (cantidad > event.capacidad) {
      setErrorMsg("No hay suficientes cupos disponibles");
      return;
    }

    try {
      setReserving(true);
      const clientId = user?.id || user?.id_cliente;
      if (!clientId) throw new Error("No se pudo identificar tu usuario.");

      const res = await fetch(`${API_BASE}/api/consolidado_eventos/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: clientId,
          evento: event?.id_evento,
          monto_pagado: cantidad * Number(event.costo_evento),
          cantidad_tickets: cantidad,
          pagado: false,
          fecha_participacion: event.fecha_inicio
        })
      });

      if (!res.ok) throw new Error('Error al procesar la reserva');

      const data = await res.json();
      
      // ESPACIO PARA EL EQUIPO DE PAGOS: 
      // Redirigir a la pasarela de pagos con el id del consolidado
      const paymentUrl = `/pagos/reserva/${data.id_consolidado_ev}`;
      router.push(paymentUrl);
      
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setReserving(false);
    }
  };

  if (!visible || !event) return null;

  if (ticket) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 transition-opacity">
        <div className="bg-[#f4ede0] rounded-3xl overflow-hidden max-w-2xl w-full flex flex-col md:flex-row shadow-2xl relative">
          
          <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div className="bg-[#557149] text-white p-8 md:w-1/3 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#728f64]">
            <h3 className="text-xl font-bold mb-4">Reserva Exitosa</h3>
            <div className="bg-white p-4 rounded-xl shadow-inner mb-4">
              <QRCode value={ticket.codigo} size={150} />
            </div>
            <p className="text-2xl tracking-widest font-mono font-black">{ticket.codigo}</p>
            <p className="text-xs text-white/80 mt-2 text-center">Muestra este código al líder del evento</p>
          </div>

          <div className="p-8 md:w-2/3 flex flex-col justify-center">
            <h2 className="text-3xl font-black text-[#2c3a26] mb-2">{event.nombre}</h2>
            <div className="text-[#557149] font-semibold text-sm mb-6 flex gap-2 flex-wrap">
              <span className="bg-[#557149]/10 px-3 py-1 rounded-full">{nombreTerritorio || event?.nombre_territorio || 'Territorio'}</span>
              <span className="bg-[#557149]/10 px-3 py-1 rounded-full">Fecha: {new Date(event.fecha_inicio).toLocaleDateString()}</span>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-[#c9d4be] shadow-sm">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Datos del Turista</p>
                <p className="font-semibold text-[#2c3a26]">{user?.nombre_completo || user?.nombre || 'Turista'}</p>
                <p className="text-sm text-gray-600">{user?.usuario_email || 'Sin correo'}</p>
                <p className="text-sm text-gray-600">{user?.telefono || 'Sin teléfono'}</p>
              </div>

              <div className="flex justify-between bg-white p-4 rounded-xl border border-[#c9d4be] shadow-sm">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Compra</p>
                  <p className="font-semibold text-[#2c3a26]">{new Date(ticket.fecha_generacion).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Pagado</p>
                  <p className="font-black text-[#557149]">
                    {event.es_gratuito || Number(event.costo_evento) === 0 ? 'Gratis' : `$${Number(event.costo_evento).toLocaleString('es-CO')}`}
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Fecha no definida';
      return d.toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return 'Fecha inválida';
    }
  };
  const formatTime = (dateString: string) => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };


  if (step === 'quantity') {
    const total = cantidad * Number(event.costo_evento);
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#2c3a26]/70 transition-all duration-300">
        <div className="bg-[#fdfbf7] w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300">
          <button onClick={() => setStep('details')} className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white transition-colors border border-white/20 shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          
          <div className="h-32 bg-[#557149] relative">
            {event.imagen && <Image src={event.imagen} alt={event.nombre} fill className="object-cover opacity-50" />}
            <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/40">
              <h2 className="text-white text-2xl font-black text-center drop-shadow-md">{event.nombre}</h2>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-xl font-bold text-[#2c3a26] mb-6 text-center">Selecciona tus Tickets</h3>
            
            <div className="flex items-center justify-center gap-6 mb-8">
              <button 
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="w-12 h-12 rounded-full bg-[#f4ede0] hover:bg-[#e8efe3] flex items-center justify-center text-[#557149] font-bold text-2xl transition-colors border border-[#d3ddca]"
              >
                -
              </button>
              <span className="text-4xl font-black text-[#2c3a26] w-16 text-center">{cantidad}</span>
              <button 
                onClick={() => setCantidad(cantidad + 1)}
                className="w-12 h-12 rounded-full bg-[#f4ede0] hover:bg-[#e8efe3] flex items-center justify-center text-[#557149] font-bold text-2xl transition-colors border border-[#d3ddca]"
              >
                +
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center mb-6 border border-red-200">
                {errorMsg}
              </div>
            )}

            <div className="bg-[#f4ede0] p-4 rounded-xl mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#6b7a63] font-medium">Precio unitario</span>
                <span className="text-[#2c3a26] font-bold">${Number(event.costo_evento).toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#d3ddca]">
                <span className="text-[#2c3a26] font-bold uppercase tracking-wider">Total a Pagar</span>
                <span className="text-2xl font-black text-[#557149]">${total.toLocaleString('es-CO')} <span className="text-sm font-normal">COP</span></span>
              </div>
            </div>

            <button 
              onClick={handlePagar}
              disabled={reserving}
              className="w-full py-4 bg-[#557149] hover:bg-[#3b5630] text-white font-bold rounded-xl shadow-lg shadow-[#557149]/30 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
            >
              {reserving ? 'Procesando...' : 'Ir a pagar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#2c3a26]/70 transition-all duration-300">
      <div 
        className="bg-[#fdfbf7] w-full max-w-4xl max-h-[90vh] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-in fade-in zoom-in duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white transition-colors border border-white/20 shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        {/* Imagen del Evento */}
        <div className="w-full md:w-2/5 h-64 md:h-auto relative bg-[#557149] shrink-0">
          {event.imagen ? (
            <Image src={event.imagen} alt={event.nombre} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#557149] to-[#8c9a80]">
              <span className="text-white font-bold opacity-30 text-3xl tracking-widest uppercase">Raíz Viva</span>
            </div>
          )}
          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
            <span className="bg-[#557149] text-white text-xs font-bold px-3 py-1.5 rounded-full w-max mb-3">
              {event.id_categoria?.nombre || 'General'}
            </span>
            <h2 className="text-white text-3xl font-black leading-tight drop-shadow-md">{event.nombre}</h2>
          </div>
        </div>

        {/* Contenido (Scrollable) */}
        <div className="w-full md:w-3/5 overflow-y-auto flex flex-col bg-white">
          <div className="p-6 md:p-8 space-y-8 flex-1">
            
            {/* Detalles principales */}
            <div className="flex flex-wrap gap-4 text-sm font-medium text-[#6b7a63] border-b border-[#e8efe3] pb-6">
              <div className="flex items-center gap-2 bg-[#f4ede0] px-4 py-2 rounded-xl">
                <svg className="w-5 h-5 text-[#557149]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <div className="flex flex-col">
                  <span className="text-[#2c3a26] capitalize">{formatDate(event.fecha_inicio)}</span>
                  <span className="text-xs">{formatTime(event.fecha_inicio)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#f4ede0] px-4 py-2 rounded-xl">
                <svg className="w-5 h-5 text-[#557149]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <span className="text-[#2c3a26]">{event.capacidad} Cupos</span>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <h3 className="text-xl font-bold text-[#2c3a26] mb-3">Sobre la Aventura</h3>
              <p className="text-[#6b7a63] leading-relaxed">
                {event.descripcion || 'Este evento no tiene una descripción detallada, pero te aseguramos una gran experiencia ecológica.'}
              </p>
            </div>

            {/* Colaboradores */}
            <div>
              <h3 className="text-xl font-bold text-[#2c3a26] mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#8c9a80]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
                Anfitriones y Colaboradores
              </h3>
              
              {loading ? (
                <div className="flex gap-2 items-center text-[#8c9a80]">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Cargando anfitriones...
                </div>
              ) : colaboradores.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {colaboradores.map(c => (
                    <div key={c.id_colaborador} className="bg-[#f4ede0]/50 border border-[#d3ddca] rounded-2xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#557149] text-white flex items-center justify-center font-bold text-lg">
                          {c.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#2c3a26] leading-tight">{c.nombre}</h4>
                          <span className="text-[10px] text-[#8c9a80] uppercase tracking-wider font-bold">Anfitrión</span>
                        </div>
                      </div>
                      
                      {c.servicios.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {c.servicios.map(s => (
                            <span key={s.id || Math.random()} className="bg-white border border-[#c9d4be] text-[#557149] text-[10px] font-bold px-2 py-1 rounded-md">
                              {s.nombre || 'Servicio'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#8c9a80] italic">Colaborador general</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#8c9a80] italic">Este evento está gestionado íntegramente por su organizador principal.</p>
              )}
            </div>
          </div>

          {/* Footer (Reserva) */}
          <div className="p-6 border-t border-[#e8efe3] bg-[#fdfbf7] shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-xs font-bold text-[#8c9a80] uppercase tracking-wider mb-1">Precio por persona</p>
                <div className="text-3xl font-black text-[#2c3a26]">
                  {isFree ? 'Gratis' : `$${Number(event.costo_evento).toLocaleString('es-CO')}`}
                  {!isFree && <span className="text-sm text-[#8c9a80] font-normal ml-1">COP</span>}
                </div>
              </div>
              <button 
                onClick={handleReservarClick}
                disabled={reserving}
                className="w-full sm:w-auto px-10 py-4 bg-[#557149] hover:bg-[#3b5630] text-white font-bold rounded-xl shadow-lg shadow-[#557149]/30 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
              >
                {reserving ? 'Reservando...' : 'Reservar Cupo'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
