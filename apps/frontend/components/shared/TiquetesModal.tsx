"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "react-qr-code";
import { useAuth } from "@/hooks/useAuth";

interface TiquetesModalProps {
  onClose: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function TiquetesModal({ onClose }: TiquetesModalProps) {
  const { user } = useAuth();
  const clientId = user?.id || user?.id_cliente;

  const [tiquetes, setTiquetes] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [territorios, setTerritorios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;

    setLoading(true);
    setError(null);

    // Cargar territorios, eventos y tiquetes
    Promise.all([
      fetch(`${API_BASE}/api/territorios/`).then((res) => (res.ok ? res.json() : [])),
      fetch(`${API_BASE}/api/eventos/`).then((res) => (res.ok ? res.json() : [])),
      fetch(`${API_BASE}/api/tiquetes/?cliente=${clientId}`).then((res) => {
        if (!res.ok) throw new Error("No se pudieron cargar los tiquetes.");
        return res.json();
      }),
    ])
      .then(([territoriosData, eventosData, tiquetesData]) => {
        setTerritorios(territoriosData);
        setEvents(eventosData);
        setTiquetes(tiquetesData);
      })
      .catch((e: any) => {
        setError(e.message || "Error al cargar tus tickets.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [clientId]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col relative animate-in zoom-in-95 duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="px-6 py-5 border-b border-[#f4ede0] flex items-center justify-between shrink-0 bg-[#3b5630] text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎟️</span>
            <h2 className="text-lg font-bold">Mis Tickets y QRs de Ingreso</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fdfbf7]">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#557149]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm max-w-md mx-auto text-center">
              {error}
            </div>
          ) : tiquetes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#8c9a80] p-12 text-center max-w-md mx-auto my-6">
              <span className="text-4xl mb-3 block">🎟️</span>
              <h3 className="text-lg font-bold text-[#4a633f] mb-1">No tienes tiquetes generados</h3>
              <p className="text-[#8c9a80] text-sm">Reserva o compra entradas para visualizar tus códigos de ingreso.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {tiquetes.map((t) => {
                const isEvent = !!t.id_evento;
                const event = isEvent ? events.find((ev) => ev.id_evento === t.id_evento) : null;

                if (isEvent && !event) return null;
                if (!isEvent && !t.id_experiencia) return null;

                const title = isEvent && event ? event.nombre : (t.id_experiencia?.nombre || "Eco-Aventura");
                const region = isEvent && event
                  ? (territorios.find((tr) => tr.id_territorio === event.id_territorio)?.nombre_territorio || "Territorio")
                  : "Eco-Aventura";
                const dateText = isEvent && event
                  ? formatDate(event.fecha_inicio)
                  : `Comprado: ${formatDate(t.fecha_generacion)}`;
                const imageUrl = isEvent && event ? event.imagen : null;

                return (
                  <div key={t.id_tiquete} className="bg-white rounded-2xl border border-[#e8efe3] overflow-hidden shadow-sm flex flex-col items-center p-5 hover:shadow-md transition-shadow relative">
                    <div className="w-full flex items-center gap-3 mb-3 pb-3 border-b border-[#f4ede0]">
                      <div className="w-10 h-10 relative bg-[#557149] rounded-lg overflow-hidden shrink-0 shadow-inner">
                        {imageUrl ? (
                          <Image src={imageUrl} alt={title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-[9px] font-bold">RV</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold text-xs text-[#2c3a26] truncate">{title}</h3>
                        <p className="text-[9px] text-[#6b7a63] font-semibold">{region}</p>
                        <p className="text-[9px] text-[#8c9a80]">{dateText}</p>
                      </div>
                    </div>

                    {/* QR Code Container */}
                    <div 
                      onClick={() => setSelectedQR(t.codigo)}
                      className="bg-[#fdfbf7] p-3 rounded-xl border border-[#e8e0d0] shadow-inner mb-3 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-sm"
                      title="Hacer clic para ampliar QR"
                    >
                      <QRCode value={t.codigo} size={110} />
                    </div>

                    <p className="text-sm font-mono font-black text-[#557149] tracking-widest uppercase mb-0.5">{t.codigo}</p>
                    <p className="text-[9px] text-[#8c9a80] uppercase tracking-wider font-bold">Toca para ampliar</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal QR Ampliado Interno */}
        {selectedQR && (
          <div 
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 transition-opacity animate-in fade-in duration-200" 
            onClick={() => setSelectedQR(null)}
          >
            <div 
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full flex flex-col items-center shadow-2xl relative animate-in zoom-in-95 duration-300" 
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedQR(null)} 
                className="absolute top-4 right-4 text-[#8c9a80] hover:text-[#557149] bg-[#f4ede0] hover:bg-[#e8efe3] p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-base font-bold text-[#2c3a26] mb-5">Código de Acceso</h3>
              <div className="bg-[#fdfbf7] p-5 rounded-2xl border border-[#e8e0d0] shadow-inner mb-5">
                <QRCode value={selectedQR} size={180} />
              </div>
              <p className="text-xl font-mono font-black text-[#557149] tracking-widest uppercase mb-1">{selectedQR}</p>
              <p className="text-xs text-gray-500 text-center leading-relaxed">Presenta este código QR al guía o encargado para validar tu ingreso.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
