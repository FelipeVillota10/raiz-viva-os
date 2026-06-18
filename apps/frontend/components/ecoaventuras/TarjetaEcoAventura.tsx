"use client";                                                        // ← agregar

import Link from "next/link";
import { EcoAventura } from "@/services/ecoaventuras";
import BotonAgregarPaquete from "@/components/ecoaventuras/BotonAgregarPaquete"; // 

const DIFICULTAD_COLOR: Record<string, string> = {
  BAJA: "bg-green-100 text-green-800",
  MEDIA: "bg-yellow-100 text-yellow-800",
  ALTA: "bg-red-100 text-red-800",
};

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop";

interface Props {
  eco: EcoAventura;
}

export function TarjetaEcoAventura({ eco }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">  
      
      {/* Zona de navegación al detalle */}
      <Link href={`/ecoaventuras/${eco.id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img
            src={eco.imagen_url || PLACEHOLDER}
            alt={eco.nombre}
            className="w-full h-full object-cover"
          />
          <span
            className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full ${
              DIFICULTAD_COLOR[eco.dificultad] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {eco.dificultad_display}
          </span>
        </div>

        <div className="px-4 pt-4 flex flex-col gap-2">
          <h3 className="font-semibold text-[#3a5c2e] text-base leading-tight line-clamp-2">
            {eco.nombre}
          </h3>

          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <span>📍</span>
            <span className="truncate">{eco.ubicacion}</span>
          </div>

          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <span>⏱</span>
            <span>{eco.duracion_display}</span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[#3a5c2e] font-bold text-lg">
              ${Number(eco.precio).toLocaleString("es-CO")}
            </span>
            <span className="text-xs text-gray-400">por persona</span>
          </div>

          <div className="mt-1 text-center text-xs font-semibold text-emerald-700 bg-emerald-50 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors">
            Ver información detallada →
          </div>
        </div>
      </Link>

      
      <div className="px-4 pb-4 pt-2">                              
        <BotonAgregarPaquete
          ecoaventuraId={eco.id}
          precio={Number(eco.precio)}
          capacidadMaxima={eco.capacidad_maxima ?? 1}  
        />                                                           
      </div>                                                         

    </div>
  );
}
