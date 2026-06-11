'use client';
 
import React from 'react';
import { Modal }  from '@/app/views/components/shared/Modal';
import { Button } from '@/app/views/components/shared/Button';
 
interface Props {
  visible:    boolean;
  eventName:  string;
  onConfirm:  () => Promise<void>;
  onClose:    () => void;
  isLoading?: boolean;
}
 
export function PublishConfirmModal({
  visible,
  eventName,
  onConfirm,
  onClose,
  isLoading = false,
}: Props) {
  return (
    <Modal
      visible={visible}
      title="Publicar evento"
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
            variant="primary"
            size="md"
            isLoading={isLoading}
            onClick={onConfirm}
            className="flex-1"
            style={{ background: '#3b5630' }}
          >
            {isLoading ? 'Publicando...' : 'Publicar'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[#2c3a26]">
          Estas a punto de publicar el evento:
        </p>
        <p className="text-sm font-semibold text-[#557149] bg-[#f4ede0] rounded-lg px-3 py-2">
          {eventName}
        </p>
        <p className="text-xs text-[#6b7a63]">
          El evento cambiara a estado Pendiente y quedara visible en el marketplace
          una vez sea aprobado.
        </p>
        <div className="bg-[#f4ede0] border border-[#c9d4be] rounded-lg px-3 py-2 text-xs text-[#557149]">
          Asegurate de que toda la informacion este completa antes de publicar.
        </div>
      </div>
    </Modal>
  );
}
 