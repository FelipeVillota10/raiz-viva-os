"use client";

import Image from "next/image";
import Link from "next/link";
import BotonPaqueteHeader from "@/components/ecoaventuras/BotonPaqueteHeader";

export function Header() {
  return (
    <header className="flex justify-between items-center px-4 py-2 h-16 bg-[#3b5630] text-white shadow-md">

      {/* Logo igual al AppHeader */}
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/raiz_header.png"
          alt="Logo Raíz Viva"
          width={256}
          height={256}
          className="w-64 h-64 object-contain mt-2"
        />

        <span className="font-medium text-base hidden sm:inline self-center">
          Eco-Aventuras
        </span>
      </Link>

      {/* Botones propios de Ecoaventuras */}
      <nav className="flex items-center gap-3">

        <Link
          href="/ecoaventuras"
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition"
        >
          Catálogo
        </Link>

        <BotonPaqueteHeader />
        
        

      </nav>

    </header>
  );
}