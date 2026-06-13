/**
 * Toast de éxito reutilizable
 * @celula - Celula1
 * Muestra un mensaje de éxito en una pill verde.
 */

'use client';

import React from 'react';

interface ToastSuccessProps {
  message: string;
}

export function ToastSuccess({ message }: ToastSuccessProps) {
  return (
    <div className="mb-4 p-4 bg-[#10b981] text-white rounded-xl text-center font-medium">
      {message}
    </div>
  );
}
