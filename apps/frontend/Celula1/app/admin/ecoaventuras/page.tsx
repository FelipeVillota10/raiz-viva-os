"use client";

import { useEffect, useState } from "react";
import { EcoAventura, getAllAdmin } from "../../services/ecoaventuras";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { ListaAdmin } from "./components/ListaAdmin";
import { FormEcoAventura } from "./components/FormEcoAventura";
import { FormItinerario } from "./components/FormItinerario";

type Vista = "lista" | "form" | "itinerario";

export default function AdminEcoAventurasPage() {
  const [ecoaventuras, setEcoaventuras] = useState<EcoAventura[]>([]);
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState<Vista>("lista");
  const [seleccionada, setSeleccionada] = useState<EcoAventura | null>(null);

  const cargar = async () => {
    setCargando(true);
    try { setEcoaventuras(await getAllAdmin()); } finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  const handleGuardado = (eco: EcoAventura) => {
    setEcoaventuras((prev) => {
      const idx = prev.findIndex((e) => e.id === eco.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = eco; return n; }
      return [eco, ...prev];
    });
    setVista("lista");
  };

  return (
    <main className="flex flex-col min-h-screen bg-[#f9f3e7]">
      <Header />

      <div className="max-w-6xl mx-auto w-full px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#3b5630]">Panel de Eco-Aventuras</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {ecoaventuras.length} experiencia{ecoaventuras.length !== 1 ? "s" : ""} registrada{ecoaventuras.length !== 1 ? "s" : ""}
            </p>
          </div>
          {vista === "lista" ? (
            <button onClick={() => { setSeleccionada(null); setVista("form"); }}
              className="bg-[#3b5630] hover:bg-[#557149] text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              + Nueva eco-aventura
            </button>
          ) : (
            <button onClick={() => setVista("lista")} className="text-sm text-gray-500 hover:text-gray-700 transition">
              ← Volver a la lista
            </button>
          )}
        </div>

        {cargando ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 animate-pulse text-sm">Cargando...</div>
        ) : (
          <>
            {vista === "lista" && (
              <ListaAdmin
                ecoaventuras={ecoaventuras}
                onEditar={(eco) => { setSeleccionada(eco); setVista("form"); }}
                onItinerario={(eco) => { setSeleccionada(eco); setVista("itinerario"); }}
                onActualizar={(eco) => setEcoaventuras((prev) => prev.map((e) => (e.id === eco.id ? eco : e)))}
              />
            )}
            {vista === "form" && (
              <FormEcoAventura inicial={seleccionada} onGuardado={handleGuardado} onCancelar={() => setVista("lista")} />
            )}
            {vista === "itinerario" && seleccionada && (
              <FormItinerario ecoaventuraId={seleccionada.id} nombreEco={seleccionada.nombre} onCerrar={() => setVista("lista")} />
            )}
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
