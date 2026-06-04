// views/components/events/EventListHeader.tsx
'use client';
 
import React from 'react';
import { useRouter } from 'next/navigation';
 
interface Props {
  search:    string;
  onSearch:  (value: string) => void;
  total:     number;
}
 
export function EventListHeader({ search, onSearch, total }: Props) {
  const router = useRouter();
 
  return (
    <div className="flex flex-col gap-3 px-4 py-4 bg-white border-b border-[#c9d4be]">
      {/* Titulo + boton crear */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-[#2c3a26]">Mis eventos</h1>
          <p className="text-xs text-[#6b7a63]">{total} evento{total !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => router.push('/actor/events/create')}
          className="bg-[#3b5630] hover:bg-[#2c3a26] text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors"
        >
          + Crear evento
        </button>
      </div>
 
      {/* Buscador */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c9a80] text-sm">
          🔍
        </span>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-sm bg-[#f9f3e7] border border-[#c9d4be] rounded-lg focus:outline-none focus:border-[#557149] text-[#2c3a26] placeholder:text-[#9eaa94]"
        />
      </div>
    </div>
  );
}