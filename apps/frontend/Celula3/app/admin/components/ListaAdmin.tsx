"use client";

import { EcoAventura, toggleActivo } from "../../services/ecoaventuras";

const DIFICULTAD_COLOR: Record<string, string> = {
  BAJA: "text-green-700 bg-green-50",
  MEDIA: "text-yellow-700 bg-yellow-50",
  ALTA: "text-red-700 bg-red-50",
};

interface Props {
  ecoaventuras: EcoAventura[];
  onEditar: (eco: EcoAventura) => void;
  onItinerario: (eco: EcoAventura) => void;
  onActualizar: (eco: EcoAventura) => void;
}

export function ListaAdmin({ ecoaventuras, onEditar, onItinerario, onActualizar }: Props) {
  const handleToggle = async (eco: EcoAventura) => {
    try {
      const actualizada = await toggleActivo(eco.id);
      onActualizar(actualizada);
    } catch {
      alert("Error al cambiar el estado.");
    }
  };

  if (ecoaventuras.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-3xl mb-2">🌱</p>
        <p>Aún no hay eco-aventuras registradas.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl shadow-sm">
      <table className="w-full text-sm bg-white">
        <thead>
          <tr className="bg-[#3a5c2e] text-white text-left">
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">Ubicación</th>
            <th className="px-4 py-3 font-medium">Precio</th>
            <th className="px-4 py-3 font-medium">Dificultad</th>
            <th className="px-4 py-3 font-medium">Duración</th>
            <th className="px-4 py-3 font-medium text-center">Estado</th>
            <th className="px-4 py-3 font-medium text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {ecoaventuras.map((eco) => (
            <tr key={eco.id} className={`hover:bg-gray-50 transition ${!eco.activo ? "opacity-50" : ""}`}>
              <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px] truncate">
                {eco.nombre}
              </td>
              <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{eco.ubicacion}</td>
              <td className="px-4 py-3 text-gray-700 font-medium">
                ${Number(eco.precio).toLocaleString("es-CO")}
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFICULTAD_COLOR[eco.dificultad] ?? ""}`}>
                  {eco.dificultad_display}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">{eco.duracion_display}</td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => handleToggle(eco)}
                  title={eco.activo ? "Desactivar" : "Activar"}
                  className={`w-10 h-5 rounded-full transition relative ${
                    eco.activo ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      eco.activo ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => onEditar(eco)}
                    className="text-xs bg-[#557149] hover:bg-[#3a5c2e] text-white px-3 py-1 rounded-lg transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onItinerario(eco)}
                    className="text-xs border border-[#557149] text-[#557149] hover:bg-green-50 px-3 py-1 rounded-lg transition"
                  >
                    Itinerario
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
