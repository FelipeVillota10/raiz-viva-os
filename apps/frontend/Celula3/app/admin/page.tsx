"use client";

import { useEffect, useState } from "react";
import { EcoAventura, getAllAdmin } from "../services/ecoaventuras";
import { Header } from "../components/Header";
import { ListaAdmin } from "./components/ListaAdmin";
import { FormEcoAventura } from "./components/FormEcoAventura";
import { FormItinerario } from "./components/FormItinerario";

type Vista = "lista" | "form" | "itinerario";

export default function AdminPage() {
  const [ecoaventuras, setEcoaventuras] = useState<EcoAventura[]>([]);
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState<Vista>("lista");
  const [seleccionada, setSeleccionada] = useState<EcoAventura | null>(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await getAllAdmin();
      setEcoaventuras(data);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleGuardado = (eco: EcoAventura) => {
    setEcoaventuras((prev) => {
      const idx = prev.findIndex((e) => e.id === eco.id);
      if (idx >= 0) {
        const nueva = [...prev];
        nueva[idx] = eco;
        return nueva;
      }
      return [eco, ...prev];
    });
    setVista("lista");
  };

  const handleActualizar = (eco: EcoAventura) => {
    setEcoaventuras((prev) =>
      prev.map((e) => (e.id === eco.id ? eco : e))
    );
  };

  return (
    <div className="min-h-screen bg-[#f9f3e7]">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Encabezado del panel */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#3a5c2e]">Panel de Eco-Aventuras</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {ecoaventuras.length} experiencia{ecoaventuras.length !== 1 ? "s" : ""} registrada
              {ecoaventuras.length !== 1 ? "s" : ""}
            </p>
          </div>
          {vista === "lista" && (
            <button
              onClick={() => { setSeleccionada(null); setVista("form"); }}
              className="bg-[#3a5c2e] hover:bg-[#557149] text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              + Nueva eco-aventura
            </button>
          )}
          {vista !== "lista" && (
            <button
              onClick={() => setVista("lista")}
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              ← Volver a la lista
            </button>
          )}
        </div>

        {/* Contenido según vista */}
        {cargando ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 animate-pulse text-sm">
            Cargando eco-aventuras...
          </div>
        ) : (
          <>
            {vista === "lista" && (
              <ListaAdmin
                ecoaventuras={ecoaventuras}
                onEditar={(eco) => { setSeleccionada(eco); setVista("form"); }}
                onItinerario={(eco) => { setSeleccionada(eco); setVista("itinerario"); }}
                onActualizar={handleActualizar}
              />
            )}

            {vista === "form" && (
              <FormEcoAventura
                inicial={seleccionada}
                onGuardado={handleGuardado}
                onCancelar={() => setVista("lista")}
              />
            )}

            {vista === "itinerario" && seleccionada && (
              <FormItinerario
                ecoaventuraId={seleccionada.id}
                nombreEco={seleccionada.nombre}
                onCerrar={() => setVista("lista")}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
