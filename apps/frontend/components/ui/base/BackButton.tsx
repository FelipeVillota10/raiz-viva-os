/**
 * Botón "Volver" reutilizable
 * @celula - Celula1
 * Botón verde con flecha izquierda y label personalizable.
 */

'use client';

import React from 'react';
import { ArrowLeftIcon } from '@/components/ui/base/Icons';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export function BackButton({ onClick, label = 'Volver' }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-[#3b5630] hover:text-[#2d6530] font-medium mb-6 transition cursor-pointer"
    >
      <ArrowLeftIcon size={20} />
      {label}
    </button>
  );
}
