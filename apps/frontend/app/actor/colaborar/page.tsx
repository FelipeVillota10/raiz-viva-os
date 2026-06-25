'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { StatusBadge } from '@/components/shared/StatusBadge';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Invitacion {
  id_detalle: number;
  id_evento: number;
  distribucion_pago: string;
  id_estado: number;
}

interface Estado {
  id_estado: number;
  nombre_estado: string;
}

export default function ColaborarPage() {
  const { user } = useAuth();
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      try {
        setLoading(true);
        
        const [resInvitaciones, resEstados] = await Promise.all([
          fetch(`${API_BASE}/api/detalles_eventos/?id_colaboradores=${user.id}`),
          fetch(`${API_BASE}/api/estados/`)
        ]);

        if (resInvitaciones.ok) setInvitaciones(await resInvitaciones.json());
        if (resEstados.ok) setEstados(await resEstados.json());

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user?.id]);

  const getEstadoNombre = (id_estado: number) => {
    return estados.find(e => e.id_estado === id_estado)?.nombre_estado || 'Pendiente';
  };

  const handleRespuesta = async (id_detalle: number, aceptar: boolean) => {
    try {
      setProcesando(id_detalle);
      const res = await fetch(`${API_BASE}/api/detalles_eventos/${id_detalle}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accion: aceptar ? 'aprobar' : 'rechazar' })
      });

      if (!res.ok) throw new Error('Error al enviar respuesta');
      
      const actualizado = await res.json();
      setInvitaciones(prev => prev.map(inv => inv.id_detalle === id_detalle ? actualizado : inv));
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcesando(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando invitaciones...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8">
      <h1 className="text-2xl font-bold text-[#2c3a26] mb-2">Mis Invitaciones para Colaborar</h1>
      <p className="text-[#6b7a63] mb-8">Aquí puedes ver y gestionar las invitaciones a eventos donde solicitan tu colaboración.</p>
      
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

      <div className="space-y-4">
        {invitaciones.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-gray-200">
            <p className="text-gray-500 italic">No tienes invitaciones pendientes por ahora.</p>
          </div>
        ) : (
          invitaciones.map(inv => {
            const estadoNombre = getEstadoNombre(inv.id_estado);
            const isPendiente = estadoNombre.toLowerCase() === 'en_revision' || estadoNombre.toLowerCase() === 'pendiente';

            return (
              <div key={inv.id_detalle} className="bg-white rounded-xl border border-[#c9d4be] p-5 flex flex-col md:flex-row gap-4 items-center justify-between hover:shadow-sm transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-[#2c3a26]">Evento ID: {inv.id_evento}</h3>
                    <StatusBadge status={estadoNombre} />
                  </div>
                  <p className="text-[#6b7a63] text-sm">
                    Te han ofrecido un <strong>{inv.distribucion_pago}%</strong> de distribución del pago para colaborar en este evento.
                  </p>
                </div>
                
                {isPendiente && (
                  <div className="flex gap-2 w-full md:w-auto">
                    <button 
                      onClick={() => handleRespuesta(inv.id_detalle, false)}
                      disabled={procesando === inv.id_detalle}
                      className="flex-1 md:flex-none px-4 py-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 font-medium transition disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                    <button 
                      onClick={() => handleRespuesta(inv.id_detalle, true)}
                      disabled={procesando === inv.id_detalle}
                      className="flex-1 md:flex-none px-4 py-2 bg-[#557149] text-white rounded-lg hover:bg-[#3b5630] font-medium transition disabled:opacity-50"
                    >
                      Aceptar
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
