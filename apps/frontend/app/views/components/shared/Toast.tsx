// views/components/shared/Toast.tsx
'use client';
 
import React, { useEffect } from 'react';
 
interface ToastProps {
  visible:  boolean;
  message:  string;
  type:     'success' | 'error';
  duration?: number;   // ms, default 3500
  onClose:  () => void;
}
 
export function Toast({
  visible,
  message,
  type,
  duration = 3500,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onClose]);
 
  if (!visible) return null;
 
  const isSuccess = type === 'success';
 
  return (
    <div
      role="alert"
      aria-live="polite"
      className={[
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg',
        'min-w-55 max-w-[90vw]',
        'animate-[slideUp_0.3s_ease-out]',
        isSuccess
          ? 'bg-[#3b5630] text-white'
          : 'bg-red-600 text-white',
      ].join(' ')}
    >
      <span className="text-base shrink-0" aria-hidden="true">
        {isSuccess ? '✓' : '✕'}
      </span>
      <p className="text-sm font-medium leading-snug flex-1">{message}</p>
      <button
        onClick={onClose}
        aria-label="Cerrar notificación"
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity text-xs ml-1"
      >
        ✕
      </button>
    </div>
  );
}