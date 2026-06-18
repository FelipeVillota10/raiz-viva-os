'use client';
 
import React from 'react';
import type { EventStatus } from '@/models/event.model';
 
interface Props {
  status: EventStatus;
}
 
const STATUS_CONFIG: Record<EventStatus, { label: string; classes: string }> = {
  draft:    { label: 'Borrador',  classes: 'bg-white border border-[#c9d4be] text-[#557149]' },
  pending:  { label: 'Pendiente', classes: 'bg-amber-50 border border-amber-300 text-amber-700' },
  active:   { label: 'Activo',    classes: 'bg-green-50 border border-green-300 text-green-700' },
  inactive: { label: 'Inactivo',  classes: 'bg-red-50 border border-red-200 text-red-600' },
};
 
export function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${config.classes}`}>
      {config.label}
    </span>
  );
}
 