'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";

interface HeaderSecundarioProps {
  backRoute?: string;
  title?: string;
}

export function HeaderSecundario({ backRoute = '/', title }: HeaderSecundarioProps) {
  const router = useRouter();

  return (
    <header className="flex justify-between items-center px-4 py-2 h-16 bg-[#3b5630] text-white">
      
      <div className="flex items-center gap-2">
        <Image
          src="/raiz_header.png"
          alt="Logo de Raiz Viva"
          width={256}
          height={256}
          className="w-64 h-64 object-contain mt-2"
        />
        {title && (
          <span className="font-medium text-base hidden sm:inline self-center">{title}</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(backRoute)}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver
        </button>
      </div>

    </header>
  );
}