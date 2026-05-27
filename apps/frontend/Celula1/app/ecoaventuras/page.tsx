"use client";

import { useEffect, useState, useCallback } from "react";
import { getCatalogo, Filtros, PaginatedResponse } from "../services/ecoaventuras";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { TarjetaEcoAventura } from "./components/TarjetaEcoAventura";
import { FiltrosEcoAventuras } from "./components/FiltrosEcoAventuras";
import { Paginacion } from "./components/Paginacion";

const FILTROS_VACIOS: Filtros = { page: 1 };

export default function EcoAventurasPage() {
  const [datos, setDatos] = useState<PaginatedResponse | null>(null);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (f: Filtros) => {
    setCargando(true);
    setError(null);
    try {
      setDatos(await getCatalogo(f));
    } catch {
      setError("No se pudo cargar el catálogo. Verifica que el servidor esté activo.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(filtros); }, [filtros, cargar]);

  return (
    <main className="flex flex-col min-h-screen bg-[#f9f3e7]">
      <Header />

      <section className="bg-[#557149] text-white text-center py-10 px-4">
        <h1 className="text-3xl font-bold mb-2">Eco-Aventuras Conscientes</h1>
        <p className="text-green-200 max-w-xl mx-auto text-sm">
          Descubre experiencias que conectan con la tierra, la cultura y la comunidad.
        </p>
      </section>

      <div className="max-w-7xl mx-auto w-full px-4 py-8 flex flex-col lg:flex-row gap-6 flex-1">
        <FiltrosEcoAventuras
          filtros={filtros}
          onChange={(f) => setFiltros(f)}
          onLimpiar={() => setFiltros(FILTROS_VACIOS)}
        />

        <div className="flex-1">
          {!cargando && datos && (
            <p className="text-sm text-gray-500 mb-4">
              {datos.count === 0
                ? "No se encontraron experiencias con esos criterios."
                : `${datos.count} experiencia${datos.count !== 1 ? "s" : ""} encontrada${datos.count !== 1 ? "s" : ""}`}
            </p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
          )}

          {cargando && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm h-64 animate-pulse" />
              ))}
            </div>
          )}

          {!cargando && !error && datos?.count === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🌿</p>
              <p className="font-medium">No hay experiencias que coincidan con tu búsqueda.</p>
              <button onClick={() => setFiltros(FILTROS_VACIOS)}
                className="mt-4 text-sm text-green-700 underline hover:no-underline">
                Limpiar filtros
              </button>
            </div>
          )}

          {!cargando && !error && datos && datos.count > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {datos.results.map((eco) => (
                  <TarjetaEcoAventura key={eco.id} eco={eco} />
                ))}
              </div>
              <Paginacion
                paginaActual={datos.page}
                totalPaginas={datos.total_pages}
                onCambiar={(p) => setFiltros((f) => ({ ...f, page: p }))}
              />
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
