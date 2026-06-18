// views/components/shared/Modal.tsx
'use client';
 
import React, { useEffect } from 'react';
 
interface ModalProps {
  visible:    boolean;
  title:      string;
  children:   React.ReactNode;
  onClose:    () => void;
  footer?:    React.ReactNode;
}
 
export function Modal({ visible, title, children, onClose, footer }: ModalProps) {
  // Cerrar con Escape
  useEffect(() => {
    if (!visible) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [visible, onClose]);
 
  if (!visible) return null;
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
 
      {/* Panel */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#3b5630] px-5 py-4 flex items-center justify-between">
          <h2 id="modal-title" className="text-white text-sm font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-white/70 hover:text-white transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>
 
        {/* Body */}
        <div className="px-5 py-4">
          {children}
        </div>
 
        {/* Footer */}
        {footer && (
          <div className="px-5 pb-5 flex gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}