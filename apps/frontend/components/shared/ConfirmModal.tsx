/**
 * Modal de confirmación
 * @celula - Celula1
 * Diálogo reutilizable para confirmar acciones.
 */

'use client';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ isOpen, title, message, confirmLabel, confirmClass = 'bg-red-600 hover:bg-red-700', onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 mx-4 max-w-md w-full">
        <h3 className="text-lg font-semibold text-[#231F20] mb-2">{title}</h3>
        <p className="text-[#353535] mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-sm font-medium border border-[#8c9a80] text-[#353535] hover:bg-gray-50 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-full text-sm font-medium text-white transition cursor-pointer ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
