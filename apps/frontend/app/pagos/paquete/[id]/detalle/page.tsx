"use client";

import { useRouter } from "next/navigation";
import { use, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FondoDecorado } from "@/components/layouts/PagosFondoDecorado";

function IconoCalendario() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="flex-shrink-0">
      <rect x="1" y="2" width="14" height="13" rx="2" stroke="#1a1a1a" strokeWidth="1.4" />
      <path d="M1 6h14" stroke="#1a1a1a" strokeWidth="1.4" />
      <path d="M5 1v2M11 1v2" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="3.5" y="8.5" width="2" height="2" rx="0.4" fill="#1a1a1a" />
      <rect x="7" y="8.5" width="2" height="2" rx="0.4" fill="#1a1a1a" />
      <rect x="10.5" y="8.5" width="2" height="2" rx="0.4" fill="#1a1a1a" />
    </svg>
  );
}

export default function DetallePagoPaquetePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [consolidado, setConsolidado] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/api/consolidado_experiencias/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar el detalle del pago.");
        return res.json();
      })
      .then((data) => {
        setConsolidado(data);
      })
      .catch((e: any) => setError(e.message || "Error al cargar los datos."))
      .finally(() => setLoading(false));
  }, [id]);

  // Guard de autenticación
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (loading || authLoading) {
    return (
      <FondoDecorado>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-[#6b7c45]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-[#3b5630] font-medium">Cargando comprobante de pago...</p>
          </div>
        </div>
      </FondoDecorado>
    );
  }

  if (error || !consolidado) {
    return (
      <FondoDecorado>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-md border border-[#e8e0d0] p-8 max-w-md text-center">
            <span className="text-4xl">⚠️</span>
            <p className="mt-4 text-red-600 font-medium">{error || "Detalle de pago no encontrado."}</p>
            <button onClick={() => router.push("/ecoaventuras")} className="mt-4 text-[#6b7c45] font-semibold underline cursor-pointer">
              Volver al Catálogo
            </button>
          </div>
        </div>
      </FondoDecorado>
    );
  }

  const paquete = consolidado.paquete;

  return (
    <FondoDecorado>
      {/* Header */}
      <div className="relative z-10 w-full px-4 sm:px-6 pt-6 pb-2">
        <div className="max-w-md sm:max-w-lg mx-auto">
          <div className="flex items-center relative">
            <button
              onClick={() => router.push("/ecoaventuras")}
              className="text-xl text-[#1a1a1a] hover:opacity-60 transition cursor-pointer"
              aria-label="Volver"
            >
              ←
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 font-bold text-lg sm:text-xl text-[#1a1a1a] whitespace-nowrap">
              Pago Exitoso del Paquete
            </h1>
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="relative z-10 flex-1 flex flex-col max-w-md sm:max-w-lg mx-auto w-full px-4 sm:px-6 pt-4 pb-36 gap-4">

        <div className="bg-[#f5f0e8] border border-[#e8e0d0] rounded-2xl px-5 py-3.5 flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-800">
            Reserva #{consolidado.id_consolidado_exp} confirmada en Neon
          </span>
        </div>

        {/* Resumen del viaje */}
        <div className="bg-white border border-[#e8e0d0] rounded-2xl p-5 sm:p-6 shadow-sm">
          <p className="font-bold text-base sm:text-lg text-[#1a1a1a] mb-4">
            Resumen de Eco-Aventuras Adquiridas
          </p>

          <div className="space-y-4">
            {paquete?.items?.map((item: any) => (
              <div key={item.id} className="border-b border-[#e0d8c8] pb-3 last:border-b-0 last:pb-0">
                <p className="font-semibold text-sm sm:text-base text-gray-800">{item.ecoaventura.nombre}</p>
                <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500 mt-1">
                  <span>
                    {item.num_personas} persona{item.num_personas !== 1 ? "s" : ""}{" "}
                    {item.fecha_reserva && `| Fecha: ${new Date(item.fecha_reserva + "T00:00:00").toLocaleDateString("es-CO")}`}
                  </span>
                  <span className="font-semibold text-gray-700">
                    ${Number(item.subtotal).toLocaleString("es-CO")} COP
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 mt-4 pt-4 border-t border-[#e0d8c8]">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Monto Pagado:</span>
              <span className="text-sm font-bold text-[#1a1a1a]">
                ${Number(consolidado.monto_pagado).toLocaleString("es-CO")} COP
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Fecha de Pago:</span>
              <span className="text-sm text-[#1a1a1a] flex items-center gap-1">
                <IconoCalendario />
                {new Date(consolidado.fecha_participacion).toLocaleDateString("es-CO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Estado:</span>
              <span className="text-sm font-bold text-green-600">✓ Pago Completado</span>
            </div>
          </div>
        </div>

        {/* Sección de ayuda/soporte */}
        <div className="bg-white border border-[#e8e0d0] rounded-2xl p-5 sm:p-6 shadow-sm">
          <p className="font-bold text-sm text-[#1a1a1a] mb-2">¡Tu viaje está listo!</p>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Se ha enviado un correo electrónico de confirmación a tu dirección registrada con el itinerario de todas las aventuras y los datos de contacto de cada líder de territorio.
          </p>
        </div>
      </div>

      {/* Barra inferior fija */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-md sm:max-w-lg mx-auto">
          <div className="bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.10)] rounded-t-3xl px-6 pt-5 pb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm sm:text-base text-[#4b5563]">Total Pagado:</span>
              <span className="text-lg sm:text-xl font-bold text-[#1a1a1a]">
                ${Number(consolidado.monto_pagado).toLocaleString("es-CO")} COP
              </span>
            </div>

            <button
              onClick={() => router.push("/ecoaventuras")}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-4 font-semibold text-base sm:text-lg transition cursor-pointer text-center block"
            >
              ✓ Pago Completado — Volver a Catálogo
            </button>
          </div>
        </div>
      </div>
    </FondoDecorado>
  );
}
