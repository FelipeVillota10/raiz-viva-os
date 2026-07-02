"use client";

import { useRouter } from "next/navigation";
import { use, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { PaqueteItem } from "@/services/paqueteService";
import type { CuponRespuesta } from "@/models/pago";
import { validarCupon } from "@/services/pago.service";

export default function PagarPaquetePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [consolidado, setConsolidado] = useState<any | null>(null);
  const [loadingConsolidado, setLoadingConsolidado] = useState(true);
  const [errorConsolidado, setErrorConsolidado] = useState<string | null>(null);

  const [cuponCodigo, setCuponCodigo] = useState("");
  const [cupon, setCupon] = useState<CuponRespuesta | null>(null);
  const [validandoCupon, setValidandoCupon] = useState(false);
  const [errorCupon, setErrorCupon] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [loadingPago, setLoadingPago] = useState(false);
  const [errorPago, setErrorPago] = useState<string | null>(null);
  const [simulatingPago, setSimulatingPago] = useState(false);

  // Cargar el consolidado (que incluye el paquete serializado)
  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    setLoadingConsolidado(true);
    setErrorConsolidado(null);

    fetch(`${API_BASE}/api/consolidado_experiencias/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar la información del pago.");
        return res.json();
      })
      .then((data) => {
        setConsolidado(data);
      })
      .catch((e: any) => {
        setErrorConsolidado(e.message || "Error al cargar la información del pago.");
      })
      .finally(() => {
        setLoadingConsolidado(false);
      });
  }, [id]);

  // Pre-llenar datos del usuario
  useEffect(() => {
    if (user) {
      if (!nombre && (user.nombre_completo || user.nombre)) {
        setNombre(user.nombre_completo || user.nombre || "");
      }
      if (!email && user.usuario_email) {
        setEmail(user.usuario_email);
      }
    }
  }, [user, nombre, email]);

  const paquete = consolidado?.paquete;
  const montoBase = Number(consolidado?.monto_pagado || 0);

  const montoFinal = cupon
    ? cupon.tipo === "porcentaje"
      ? Math.max(montoBase - (montoBase * parseFloat(cupon.valor)) / 100, 0)
      : Math.max(montoBase - parseFloat(cupon.valor), 0)
    : montoBase;

  const tieneDescuento = montoFinal < montoBase;

  const handleAplicarCupon = useCallback(async () => {
    if (!cuponCodigo.trim()) return;
    setValidandoCupon(true);
    setErrorCupon(null);
    setCupon(null);
    try {
      const result = await validarCupon(cuponCodigo.trim());
      if (!result.disponible) {
        setErrorCupon("El cupón no está disponible o ha expirado.");
        return;
      }
      setCupon(result);
    } catch (e: any) {
      setErrorCupon(e.message || "Cupón no válido.");
    } finally {
      setValidandoCupon(false);
    }
  }, [cuponCodigo]);

  const handleQuitarCupon = useCallback(() => {
    setCupon(null);
    setCuponCodigo("");
    setErrorCupon(null);
  }, []);

  const handlePagar = useCallback(async () => {
    if (!consolidado) return;
    if (!email.trim()) {
      setErrorPago("Ingrese su correo electrónico.");
      return;
    }
    if (!nombre.trim()) {
      setErrorPago("Ingrese su nombre completo.");
      return;
    }

    setErrorPago(null);
    setLoadingPago(true);

    setTimeout(() => {
      setLoadingPago(false);
      router.push(`/pagos/paquete/${id}/detalle`);
    }, 1200);
  }, [consolidado, email, nombre, id, router]);

  const handleSimularPago = useCallback(() => {
    if (!consolidado) return;
    setErrorPago(null);
    setSimulatingPago(true);

    setTimeout(() => {
      setSimulatingPago(false);
      router.push(`/pagos/paquete/${id}/detalle`);
    }, 1200);
  }, [consolidado, id, router]);

  // Guard de autenticación
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (loadingConsolidado || authLoading) {
    return (
      <div className="min-h-screen bg-[#f9f3e7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-[#6b7c45]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-[#3b5630] font-medium">Cargando detalles del viaje...</p>
        </div>
      </div>
    );
  }

  if (errorConsolidado || !consolidado || !paquete || paquete.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f9f3e7] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md border border-[#e8e0d0] p-8 max-w-md text-center">
          <span className="text-4xl">⚠️</span>
          <p className="mt-4 text-red-600 font-medium">
            {errorConsolidado || "El paquete está vacío o no se encontró."}
          </p>
          <button
            onClick={() => router.push("/ecoaventuras")}
            className="mt-4 text-[#6b7c45] font-semibold underline cursor-pointer"
          >
            Ir al catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f3e7] relative flex flex-col">
      <span className="absolute top-2 left-2 text-4xl opacity-20 pointer-events-none select-none">🌿</span>
      <span className="absolute top-2 right-2 text-4xl opacity-20 pointer-events-none select-none rotate-45">
        &nbsp;
      </span>

      <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="max-w-md sm:max-w-lg lg:max-w-5xl mx-auto">
          <div className="flex items-center relative">
            <button
              onClick={() => router.back()}
              className="text-xl text-[#1a1a1a] hover:opacity-60 transition cursor-pointer"
              aria-label="Volver"
            >
              ←
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 font-bold text-lg sm:text-xl text-[#1a1a1a] whitespace-nowrap">
              Pagar Paquete de Viaje
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row lg:items-start lg:gap-6 max-w-md sm:max-w-lg lg:max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 lg:pb-10">
        <div className="w-full lg:flex-[3] flex flex-col gap-4">
          <div className="rounded-2xl shadow-md border border-[#e8e0d0] overflow-hidden">
            <div className="bg-white p-5 sm:p-6">
              <p className="font-bold text-sm sm:text-base text-[#1a1a1a] mb-2">
                Resumen Detallado del Paquete
              </p>
              <p className="font-semibold text-sm sm:text-base text-[#1a1a1a] mb-3">
                Eco-Aventuras Incluidas:
              </p>
              <div className="space-y-3">
                {paquete.items.map((item: PaqueteItem) => (
                  <div key={item.id} className="flex justify-between items-start text-sm sm:text-base border-b border-gray-100 pb-2">
                    <div>
                      <p className="font-medium text-gray-800">{item.ecoaventura.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {item.num_personas} persona{item.num_personas !== 1 ? "s" : ""}{" "}
                        {item.fecha_reserva && `| Reserva: ${new Date(item.fecha_reserva + "T00:00:00").toLocaleDateString("es-CO")}`}
                      </p>
                    </div>
                    <span className="font-semibold text-[#1a1a1a]">
                      ${item.subtotal.toLocaleString("es-CO")} COP
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end items-center mt-4">
                <span className="text-sm sm:text-base font-bold text-[#1a1a1a]">
                  Total base: ${montoBase.toLocaleString("es-CO")} COP
                </span>
              </div>
            </div>

            <div className="bg-[#f5f0e8] px-5 sm:px-6 py-4 sm:py-5 space-y-4">
              <div className="space-y-2">
                {tieneDescuento && (
                  <div className="flex justify-between text-sm sm:text-base text-gray-500 line-through">
                    <span>Subtotal:</span>
                    <span>${montoBase.toLocaleString("es-CO")} COP</span>
                  </div>
                )}
                {cupon && tieneDescuento && (
                  <div className="flex justify-between text-sm sm:text-base text-green-700">
                    <span>
                      Descuento (
                      {cupon.tipo === "porcentaje"
                        ? `${cupon.valor}%`
                        : `$${Number(cupon.valor).toLocaleString("es-CO")}`}
                      ):
                    </span>
                    <span>
                      -${(montoBase - montoFinal).toLocaleString("es-CO")} COP
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">
                    Total a Pagar:
                  </span>
                  <span className="font-bold sm:text-lg text-[#1a1a1a]">
                    ${montoFinal.toLocaleString("es-CO")} COP
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-[#e8e0d0] p-5 sm:p-6">
            <h2 className="font-bold text-sm sm:text-base text-[#1a1a1a] mb-3">
              Cupón de Descuento
            </h2>

            {cupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                <div>
                  <p className="font-semibold text-sm text-green-800">
                    {cupon.codigo} —{" "}
                    {cupon.tipo === "porcentaje"
                      ? `${cupon.valor}% de descuento`
                      : `$${Number(cupon.valor).toLocaleString("es-CO")} de descuento`}
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Cupón aplicado correctamente
                  </p>
                </div>
                <button
                  onClick={handleQuitarCupon}
                  className="text-green-700 hover:text-green-900 font-bold text-lg cursor-pointer"
                  aria-label="Quitar cupón"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cuponCodigo}
                  onChange={(e) => {
                    setCuponCodigo(e.target.value.toUpperCase());
                    setErrorCupon(null);
                  }}
                  placeholder="Ingrese su código"
                  className="flex-1 bg-[#f5f0e8] border border-[#e8e0d0] rounded-xl p-3 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:border-[#6b7c45] transition"
                />
                <button
                  onClick={handleAplicarCupon}
                  disabled={validandoCupon || !cuponCodigo.trim()}
                  className="bg-[#6b7c45] hover:bg-[#5a6b3a] disabled:opacity-50 text-white rounded-xl px-5 font-semibold text-sm sm:text-base transition cursor-pointer"
                >
                  {validandoCupon ? "..." : "Aplicar"}
                </button>
              </div>
            )}

            {errorCupon && (
              <p className="mt-2 text-sm text-red-600">{errorCupon}</p>
            )}
          </div>
        </div>

        <div className="flex-1 lg:flex-none lg:flex-[2] bg-white rounded-t-3xl lg:rounded-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-6 sm:px-7 pt-6 pb-8 flex flex-col lg:sticky lg:top-6">
          <h2 className="font-bold text-[#1a1a1a] text-base sm:text-lg mb-4 flex items-center gap-2">
            <span>👤</span> Datos del Comprador
          </h2>

          {errorPago && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 mb-4"
            >
              <span className="text-lg leading-none">⚠️</span>
              <p className="text-sm text-red-600">{errorPago}</p>
            </div>
          )}

          <div className="space-y-3 mb-6">
            <div>
              <label htmlFor="nombre" className="sr-only">
                Nombre completo
              </label>
              <input
                id="nombre"
                type="text"
                autoComplete="name"
                placeholder="Nombre Completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-[#f5f0e8] border border-[#e8e0d0] rounded-xl p-3.5 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:border-[#6b7c45] transition"
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Correo Electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f5f0e8] border border-[#e8e0d0] rounded-xl p-3.5 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:border-[#6b7c45] transition"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-4">
            Será redirigido para completar el pago de forma segura.
          </p>

          <button
            onClick={handlePagar}
            disabled={loadingPago || simulatingPago}
            className="w-full mt-auto"
          >
            <span
              className={`flex items-center justify-center gap-2 rounded-full py-4 text-lg sm:text-xl font-semibold transition text-white cursor-pointer ${loadingPago ? "bg-[#8a9d6a]" : "bg-[#6b7c45] hover:bg-[#5a6b3a]"}`}
            >
              {loadingPago ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Procesando pago...
                </>
              ) : (
                `Pagar $${montoFinal.toLocaleString("es-CO")} COP`
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={handleSimularPago}
            disabled={loadingPago || simulatingPago}
            className="w-full mt-3 group"
          >
            <span
              className={`flex items-center justify-center gap-2 rounded-full py-4 text-lg sm:text-xl font-semibold transition text-white cursor-pointer border border-amber-600/30 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-md shadow-amber-700/20 active:scale-[0.98] ${
                loadingPago || simulatingPago ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {simulatingPago ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Simulando Pago...
                </>
              ) : (
                "🧪 Simular Pago Completo"
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
