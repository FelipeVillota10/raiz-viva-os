"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PaqueteItem } from "@/services/paqueteService";
import { usePaquete } from "@/components/ecoaventuras/PaqueteContext";
import { useAuth } from "@/hooks/useAuth";
import { POST_LOGIN_REDIRECT_KEY } from "@/components/ecoaventuras/checkoutRedirect";
import Image from "next/image";

export default function PaqueteCarrito() {
  const { paquete, carritoAbierto, cerrarCarrito, eliminarItem, vaciar, cargando } = usePaquete();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const items = paquete?.items ?? [];
  const total = paquete?.total ?? 0;

  // HU16.2: retorno automático al flujo de pago de C3 tras iniciar sesión en C1.
  // Cuando el usuario se autentica y hay un destino de checkout pendiente
  // (guardado antes de redirigir al login de Célula 1), lo devolvemos allí.
  useEffect(() => {
    if (loading || !isAuthenticated) return;
    const destino = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
    if (destino) {
      sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
      router.push(destino);
    }
  }, [isAuthenticated, loading, router]);

  const irAlCheckout = () => {
    cerrarCarrito();
    router.push("/ecoaventuras/checkout");
  };

  return (
    <>
      {carritoAbierto && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
          onClick={cerrarCarrito}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          carritoAbierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Mi Paquete</h2>
              <p className="text-xs text-gray-500">{items.length} experiencia{items.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button
            onClick={cerrarCarrito}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {cargando && (
            <div className="flex justify-center py-12">
              <svg className="w-7 h-7 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          )}

          {!cargando && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Tu paquete está vacío</p>
                <p className="text-sm text-gray-400 mt-1">Explora el catálogo y agrega experiencias</p>
              </div>
            </div>
          )}

          {!cargando && items.map((item: PaqueteItem) => (
            <div
              key={item.id}
              className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-100 transition-colors group"
            >
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

              <div className="flex flex-col items-end justify-between flex-shrink-0">
                <p className="text-sm font-bold text-emerald-700">
                  ${item.subtotal.toLocaleString("es-CO")}
                </p>
                <button
                  onClick={() => eliminarItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md hover:bg-red-50 flex items-center justify-center text-red-400 hover:text-red-600 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total del paquete</span>
              <span className="text-xl font-bold text-gray-900">
                ${total.toLocaleString("es-CO")}
              </span>
            </div>
            <button
              onClick={irAlCheckout}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
            >
              Solicitar paquete →
            </button>
            <button
              onClick={vaciar}
              className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors py-1"
            >
              Vaciar paquete
            </button>
          </div>
        )}
      </aside>
    </>
  );
}