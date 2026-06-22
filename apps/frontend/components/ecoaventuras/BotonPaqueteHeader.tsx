"use client";

import { usePaquete } from "@/components/ecoaventuras/PaqueteContext";

export default function BotonPaqueteHeader() {
  const { paquete, abrirCarrito } = usePaquete();
  const numItems = paquete?.num_items ?? 0;

  return (
    <button
      onClick={abrirCarrito}
      className="relative flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
      aria-label="Ver mi paquete"
    >
      <svg
        className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      <span className="text-sm font-semibold text-emerald-800">Mi paquete</span>

      {numItems > 0 && (
        <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-sm animate-pulse">
          {numItems}
        </span>
      )}
    </button>
  );
}