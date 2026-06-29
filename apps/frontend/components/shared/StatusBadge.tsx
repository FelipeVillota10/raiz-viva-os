'use client';
 
import React from 'react';
import type { EventStatus } from '@/models/event.model';
 
interface Props {
  status: EventStatus;
}
 
export function StatusBadge({ status }: Props) {
  const s = (status || '').toLowerCase();

  let label = status;
  let classes = 'bg-gray-50 border border-gray-300 text-gray-700';

  if (s.includes('borrador')) {
    label = 'Borrador';
    classes = 'bg-white border border-[#c9d4be] text-[#557149]';
  } else if (s.includes('revisión') || s.includes('revision') || s.includes('pending')) {
    label = 'En revisión';
    classes = 'bg-amber-50 border border-amber-300 text-amber-700';
  } else if (s.includes('aprobado')) {
    label = 'Aprobado';
    classes = 'bg-green-50 border border-green-300 text-green-700';
  } else if (s.includes('activo') || s.includes('active')) {
    if (!s.includes('inactivo')) {
      label = 'Publicado';
      classes = 'bg-[#e8efe3] border border-[#8c9a80] text-[#4a633f]';
    }
  }
  
  if (s.includes('inactivo') || s.includes('inactive')) {
    label = 'Inactivo';
    classes = 'bg-red-50 border border-red-200 text-red-600';
  }

  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${classes}`}>
      {label}
    </span>
  );
} 