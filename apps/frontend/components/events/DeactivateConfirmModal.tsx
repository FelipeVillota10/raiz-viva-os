'use client';
 
import React, { useState } from 'react';
import { Modal }  from '@/components/shared/Modal';
import { Button } from '@/components/shared/Button';
 
interface Props {
  visible:    boolean;
  eventName:  string;
  onConfirm:  () => Promise<void>;
  onClose:    () => void;
  isLoading?: boolean;
}
 
export function DeactivateConfirmModal({
  visible,
  eventName,
  onConfirm,
  onClose,
  isLoading = false,
}: Props) {
  return (
    <Modal
      visible={visible}
      title="Inactivar evento"
      onClose={onClose}
      footer={
        <>
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            size="md"
            isLoading={isLoading}
            onClick={onConfirm}
            className="flex-1"
          >
            {isLoading ? 'Inactivando...' : 'Confirmar'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[#2c3a26]">
          Estas a punto de inactivar el evento:
        </p>
        <p className="text-sm font-semibold text-[#557149] bg-[#f4ede0] rounded-lg px-3 py-2">
          {eventName}
        </p>
        <p className="text-xs text-[#6b7a63]">
          El evento dejara de ser visible en el marketplace. Esta accion puede revertirse
          desde el panel de administracion.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
          Solo puedes inactivar eventos en estado Borrador o Pendiente sin QR generados.
        </div>
      </div>
    </Modal>
  );
}