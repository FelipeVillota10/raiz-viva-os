"use client";

import React from "react";
import Image from "next/image";

interface Props {
  children: React.ReactNode;
}

export function ActorDashboardLayout({ children }: Props) {
  const showNav = false; // 👈 aquí controlas si aparece o no

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f3e7]">

      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#3b5630] text-white">

        {/* BLOQUE IZQUIERDO */}
        <div className="flex items-center gap-4">

          <Image
            src="/Celula2/logos/RaizViva-LogoFO.png"
            alt="Raíz Viva"
            width={220}
            height={80}
            className="h-14 w-auto object-contain"
          />

          <div className="flex flex-col leading-tight">
            <span className="text-xs text-white/70">
              Panel del actor
            </span>

            <span className="text-xl font-semibold text-white">
              Raíz Viva
            </span>
          </div>

        </div>

        {/* NAVEGACIÓN (CONTROLADA) */}
        {showNav && (
          <nav className="hidden lg:flex items-center gap-4 text-sm text-white/80">
            <a
              href="/actor/events"
              className="hover:text-white transition-colors"
            >
              Mis eventos
            </a>

            <a
              href="/actor/products"
              className="hover:text-white transition-colors"
            >
              Mis productos
            </a>
          </nav>
        )}

      </header>

      {/* CONTENIDO */}
      <main className="flex-1">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#3b5630] text-white text-sm text-center py-6 px-4 flex flex-col items-center gap-2">

        <p>
          © 2026 · Senda Mielera y Desarrollo de Software II-26 Univalle
        </p>

        <p>
          Inc. Todos los derechos reservados · Senda Mielera – Buitrera Palmira
        </p>

        <a
          href="#"
          className="underline hover:text-gray-200 transition"
        >
          Política de privacidad e información
        </a>

      </footer>

    </div>
  );
}