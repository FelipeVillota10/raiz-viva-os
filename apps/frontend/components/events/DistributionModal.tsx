'use client';

import React, { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Collaborator {
  id_colaborador: number;
  nombre: string;
  porcentaje: number;
  estado: string;
  servicios?: string[];
}

interface DistributionModalProps {
  visible: boolean;
  eventId: string;
  eventName: string;
  onClose: () => void;
}

export function DistributionModal({ visible, eventId, eventName, onClose }: DistributionModalProps) {
  const [colaboradores, setColaboradores] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;
    async function fetchData() {
      try {
        setLoading(true);
        // Obtener los detalles_eventos y clientes (para los nombres)
        const [resDetalles, resClientes, resEstados] = await Promise.all([
          fetch(`${API_BASE}/api/detalles_eventos/?id_evento=${eventId}`),
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
  }, [visible, eventId]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-[#557149] p-6 text-white text-center shrink-0">
          <h2 className="text-2xl font-bold">Distribución de Pago</h2>
          <p className="opacity-90 mt-1">{eventName}</p>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#557149]"></div>
            </div>
          ) : (
            <div className="bg-[#fdfbf7] border border-[#d3ddca] rounded-2xl p-5">
              <h4 className="font-bold text-[#2c3a26] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#557149]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Resumen de Ganancias
              </h4>
              
              {colaboradores.length > 0 ? (
                <ul className="space-y-3">
                  {colaboradores.map(c => (
                    <li key={c.id_colaborador} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm border-b border-[#e8efe3] pb-2 last:border-0">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#4a633f]">{c.nombre} <span className="text-xs text-gray-400">({c.estado})</span></span>
                        {c.servicios && c.servicios.length > 0 && (
                          <span className="text-xs text-[#8c9a80] mt-0.5">{c.servicios.join(', ')}</span>
                        )}
                      </div>
                      <span className="font-bold text-[#2c3a26] mt-1 sm:mt-0 text-lg">{c.porcentaje.toFixed(2)}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No hay colaboradores registrados.</p>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-center shrink-0">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 rounded-xl font-bold bg-[#f4ede0] hover:bg-[#e8efe3] text-[#557149] transition-colors w-full sm:w-auto"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
