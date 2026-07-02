"use client";

/**
 * HU16.2 — Checkout de Eco-Aventuras (Célula 3)
 *
 * Punto de entrada al pago. El usuario puede explorar sin sesión, pero al llegar
 * aquí debe estar autenticado:
 *  - Si NO está autenticado, se guarda el destino de retorno y se redirige al
 *    login YA EXISTENTE de Célula 1 (/login). Tras el login, PaqueteCarrito lo
 *    devuelve automáticamente a esta página.
 *  - Si SÍ está autenticado, se asocia el paquete al turista (backend) y se
 *    muestra el resumen con el TOTAL, listo para el pago de Célula 4.
 */

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/ecoaventuras/Header";
import { Footer } from "@/components/Footer";
import { usePaquete } from "@/components/ecoaventuras/PaqueteContext";
import { useAuth } from "@/hooks/useAuth";
import { POST_LOGIN_REDIRECT_KEY } from "@/components/ecoaventuras/checkoutRedirect";
import type { PaqueteItem } from "@/services/paqueteService";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { paquete, cargando, recargar, asociarUsuario, confirmarPago } = usePaquete();

  const [asociando, setAsociando] = useState(false);
  const [errorAsociar, setErrorAsociar] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [errorPago, setErrorPago] = useState<string | null>(null);
  const [resumenPago, setResumenPago] = useState<{ items: PaqueteItem[]; total: number } | null>(null);
  const yaAsociado = useRef(false);

  // Botón "Proceder al pago": crea la consolidación en la BD y redirige a la pantalla previa de pago.
  const handleProcederPago = async () => {
    setErrorPago(null);
    setPagando(true);
    try {
      const result = await confirmarPago();
      router.push(`/pagos/paquete/${result.id_consolidado_exp}`);
    } catch (e: any) {
      setErrorPago(e.message || "No se pudo procesar el pago. Intenta nuevamente.");
    } finally {
      setPagando(false);
    }
  };

  // Guard de autenticación: si no hay sesión, guardar el retorno y mandar al login de C1.
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, "/ecoaventuras/checkout");
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Una vez autenticado, asociar el paquete al turista (una sola vez).
  useEffect(() => {
    if (authLoading || !isAuthenticated || yaAsociado.current) return;
    yaAsociado.current = true;
    (async () => {
      try {
        setAsociando(true);
        await asociarUsuario();
      } catch {
        setErrorAsociar("No se pudo asociar tu paquete a tu cuenta. Intenta nuevamente.");
        yaAsociado.current = false;
      } finally {
        setAsociando(false);
      }
    })();
  }, [authLoading, isAuthenticated, asociarUsuario]);

  const items = resumenPago ? resumenPago.items : paquete?.items ?? [];
  const total = resumenPago ? resumenPago.total : paquete?.total ?? 0;

  // Estados de carga / redirección
  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <svg className="w-8 h-8 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-sm">Verificando tu sesión…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
      <Header />

      <main className="flex-1 px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Confirmar tu paquete</h1>
          <p className="text-sm text-gray-500 mb-6">
            Hola{user?.nombre_completo ? `, ${user.nombre_completo}` : ""}. Revisa tu paquete antes de proceder al pago.
          </p>

          {errorAsociar && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {errorAsociar}
            </div>
          )}

          {(cargando || asociando) && (
            <div className="flex justify-center py-12">
              <svg className="w-7 h-7 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          )}

          {!cargando && !asociando && items.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <p className="font-semibold text-gray-700">Tu paquete está vacío</p>
              <p className="text-sm text-gray-400 mt-1 mb-5">Agrega experiencias para continuar con el pago.</p>
              <button
                onClick={() => router.push("/ecoaventuras")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition"
              >
                Ir al catálogo
              </button>
            </div>
          )}

          {!cargando && !asociando && items.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {items.map((item: PaqueteItem) => (
                  <li key={item.id} className="flex gap-4 p-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-emerald-50 flex-shrink-0">
                      {item.ecoaventura.portada ? (
                        <Image
                          src={item.ecoaventura.portada}
                          alt={item.ecoaventura.nombre}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-7 h-7 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.ecoaventura.nombre}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.ecoaventura.ubicacion}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {item.num_personas} persona{item.num_personas !== 1 ? "s" : ""}
                        </span>
                        {item.fecha_reserva && (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            {new Date(item.fecha_reserva + "T00:00:00").toLocaleDateString("es-CO", {
                              day: "numeric", month: "short",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 self-center text-sm font-bold text-emerald-700">
                      ${item.subtotal.toLocaleString("es-CO")}
                    </div>
                  </li>
                ))}
              </ul>

              {/* TOTAL de la compra (HU16.2 #7) */}
              <div className="border-t border-gray-100 bg-gray-50 px-6 py-5">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-600">Total a pagar</span>
                  <span className="text-2xl font-extrabold text-gray-900" data-testid="checkout-total">
                    ${total.toLocaleString("es-CO")}
                  </span>
                </div>
                {confirmado ? (
                  <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
                    <p className="font-semibold">✓ Paquete confirmado y asociado a tu cuenta.</p>
                    <p className="mt-1 text-emerald-700">
                      Tu reserva quedó lista para el pago (Célula 4). Total a pagar:{" "}
                      <span className="font-bold">${total.toLocaleString("es-CO")}</span>.
                    </p>
                  </div>
                ) : (
                  <>
                    {errorPago && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                        {errorPago}
                      </div>
                    )}
                    <button
                      onClick={handleProcederPago}
                      disabled={pagando}
                      className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                      {pagando ? "Procesando pago…" : "Proceder al pago →"}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
