/**
 * Header del detalle de solicitud
 * @celula - Celula1
 * Muestra el botón de volver y los mensajes de toast/error.
 */

'use client';

import React from 'react';
import { BackButton } from '@/components/ui/base/BackButton';
import { ToastSuccess } from '@/components/ui/base/ToastSuccess';
import { ErrorBanner } from '@/components/ui/base/ErrorBanner';

interface SolicitudDetalleHeaderProps {
  onBack: () => void;
  toast: string | null;
  error: string | null;
}

export function SolicitudDetalleHeader({ onBack, toast, error }: SolicitudDetalleHeaderProps) {
  return (
    <>
      <BackButton onClick={onBack} label="Volver a Solicitudes" />
      {toast && <ToastSuccess message={toast} />}
      {error && <ErrorBanner message={error} />}
    </>
  );
}
