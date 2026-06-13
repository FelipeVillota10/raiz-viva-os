/**
 * Banner de error reutilizable
 * @celula - Celula1
 * Muestra un mensaje de error con opción de cierre opcional.
 */

'use client';

import React from 'react';

interface ErrorBannerProps {
  message: string;
  onClose?: () => void;
}

export function ErrorBanner({ message, onClose }: ErrorBannerProps) {
  return (
    <div className="mb-6 p-4 bg-[#E53935]/10 border border-[#E53935] rounded-xl text-center relative">
      <p className="text-[#E53935] font-medium">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E53935] font-bold text-lg cursor-pointer"
          aria-label="Cerrar"
        >
          &times;
        </button>
      )}
    </div>
  );
}
