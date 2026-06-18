/**
 * Estado vacío reutilizable
 * @celula - Celula1
 * Muestra un mensaje centrado cuando no hay datos.
 */

'use client';

import React from 'react';

interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({ message, className = '' }: EmptyStateProps) {
  return (
    <p className={`text-center text-[#353535] py-12 ${className}`}>
      {message}
    </p>
  );
}
