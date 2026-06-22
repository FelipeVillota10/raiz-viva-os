"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEcoAventura, EcoAventura } from "@/services/ecoaventuras";
import BotonAgregarPaquete from "@/components/ecoaventuras/BotonAgregarPaquete";

export default function DetalleEcoAventuraPage() {
  const { id } = useParams();
  const router = useRouter();
  const [aventura, setAventura] = useState<EcoAventura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    getEcoAventura(Number(id))
      .then((data) => {
        setAventura(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar el detalle de la eco-aventura.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-stone-50">
        <div className="text-xl font-semibold text-emerald-800 animate-pulse font-poppins">
          Cargando detalles de la aventura...
        </div>
      </div>
    );
  }

  if (error || !aventura) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-stone-50 p-4">
        <p className="text-xl text-red-600 mb-4">{error || "No se encontró la experiencia."}</p>
        <button 
          onClick={() => router.push("/ecoaventuras")} 
          className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition"
        >
          Volver al Catálogo
        </button>
      </div>
    );
  }

  const { itinerario } = aventura;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-stone-50 min-h-screen text-stone-800">
      {/* Botón Volver */}
      <button 
        onClick={() => router.push("/ecoaventuras")} // 🌿 Corregido para mantener al usuario en el catálogo público
        className="mb-6 flex items-center text-emerald-700 font-medium hover:text-emerald-950 transition"
      >
        ← Volver al Catálogo
      </button>

      {/* Banner Principal */}
      <div className="relative h-80 md:h-[450px] w-full rounded-2xl overflow-hidden shadow-xl mb-8">
        <img 
          src={aventura.imagen_url || "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1200&q=80"} 
          alt={aventura.nombre} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-10 text-white">
          <span className="bg-emerald-600 text-xs font-bold px-3 py-1 rounded-full uppercase w-max mb-3 tracking-wider">
            Dificultad: {aventura.dificultad_display || aventura.dificultad}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 font-poppins">{aventura.nombre}</h1>
          <p className="text-base md:text-lg text-emerald-200 flex items-center gap-2">
            <span>📍 {aventura.ubicacion}</span>
            <span>•</span>
            <span>🕒 Duración: {aventura.duracion_display || `${aventura.duracion} horas`}</span>
          </p>
        </div>
      </div>

      {/* Grid de Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Principal (Izquierda): Información y Logística */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Descripción */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <h2 className="text-2xl font-bold text-emerald-900 mb-3 font-poppins">Descripción de la Experiencia</h2>
            <p className="text-stone-600 leading-relaxed whitespace-pre-line text-sm">
              {aventura.descripcion || "Disfruta de una maravillosa aventura conectando con la naturaleza andina y las culturas locales."}
            </p>
          </section>

          {/* Itinerario y Cronograma */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <h2 className="text-2xl font-bold text-emerald-900 mb-4 font-poppins">🗓️ Itinerario Detallado</h2>
            
            {itinerario ? (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-bold text-emerald-800 text-base mb-1">Cronograma General</h4>
                  <p className="text-stone-600 bg-stone-100 p-4 rounded-xl whitespace-pre-line leading-relaxed">
                    {itinerario.cronograma}
                  </p>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-bold text-emerald-800 text-base mb-1">Actividades Ofrecidas</h4>
                  <p className="text-stone-600 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 whitespace-pre-line leading-relaxed">
                    {itinerario.actividades}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-stone-500 italic text-sm">El cronograma detallado de actividades estará disponible muy pronto.</p>
            )}
          </section>

          {/* Información de Transporte */}
          {itinerario?.transporte && (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h2 className="text-2xl font-bold text-emerald-900 mb-2 font-poppins">🚌 Información de Transporte</h2>
              <p className="text-stone-600 text-sm whitespace-pre-line leading-relaxed">{itinerario.transporte}</p>
            </section>
          )}
        </div>

        {/* Columna Lateral (Derecha): Precios y Recomendaciones */}
        <div className="space-y-6">
          
          {/* Caja de Costos */}
          <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-md border border-emerald-950">
            <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider mb-1">Precio Base</h3>
            <div className="text-4xl font-black mb-4 font-poppins">
              ${parseFloat(aventura.precio).toLocaleString('es-CO')} <span className="text-sm font-normal text-emerald-200">COP</span>
            </div>
            
            <div className="border-t border-emerald-800 pt-4 mt-2 text-sm text-emerald-100">
              <strong className="block mb-2 text-white">Desglose de Costos e Inclusiones:</strong>
              <p className="text-xs leading-relaxed opacity-90 whitespace-pre-line">
                El precio incluye acceso guiado a la zona, equipamiento básico de seguridad, asistencia médica primaria en zona y las actividades detalladas en el itinerario.
              </p>
            </div>
            
            <div className="mt-6">
              <BotonAgregarPaquete
                ecoaventuraId={Number(id)}
                precio={parseFloat(aventura.precio)}
                capacidadMaxima={aventura.capacidad_maxima ?? 1}
              />
            </div>
          </div>

          {/* Restricciones y Recomendaciones */}
          {itinerario && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
              <h3 className="text-xl font-bold text-stone-900 border-b border-stone-100 pb-2 font-poppins">Logística y Seguridad</h3>
              
              {itinerario.restricciones && (
                <div>
                  <h4 className="font-bold text-red-700 flex items-center gap-1 mb-1 text-xs">⚠️ Restricciones</h4>
                  <p className="text-stone-600 text-xs whitespace-pre-line leading-relaxed">{itinerario.restricciones}</p>
                </div>
              )}

              {itinerario.recomendaciones && (
                <div className="pt-2">
                  <h4 className="font-bold text-emerald-700 flex items-center gap-1 mb-1 text-xs">💡 Recomendaciones</h4>
                  <p className="text-stone-600 text-xs whitespace-pre-line leading-relaxed">{itinerario.recomendaciones}</p>
                </div>
              )}

              {itinerario.notas_especiales && (
                <div className="pt-2 border-t border-stone-100">
                  <h4 className="font-bold text-amber-800 text-[10px] uppercase tracking-wider mb-1">Notas Especiales</h4>
                  <p className="text-stone-500 text-xs whitespace-pre-line leading-relaxed">{itinerario.notas_especiales}</p>
                </div>
              )}

              {itinerario.contactos && (
                <div className="pt-3 border-t border-stone-100 bg-stone-50 p-3 rounded-xl">
                  <h4 className="font-bold text-stone-700 text-[10px] uppercase tracking-wider mb-1">📞 Contactos de Soporte</h4>
                  <p className="text-emerald-900 text-xs font-semibold whitespace-pre-line">{itinerario.contactos}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}