// views/components/events/wizard/WizardNavigation.tsx
'use client';
 
import React from 'react';
import { Button } from '@/components/shared/Button';
 
interface Props {
  currentStep:  number;
  totalSteps:   number;
  isLoading:    boolean;
  onPrev:       () => void;
  onNext:       () => void;
  onSave:       () => Promise<void>;
}
 
const isLastStep = (step: number, total: number) => step === total - 1;
 
export function WizardNavigation({
  currentStep,
  totalSteps,
  isLoading,
  onPrev,
  onNext,
  onSave,
}: Props) {
  const last = isLastStep(currentStep, totalSteps);
 
  return (
    <div className="border-t border-[#c9d4be] bg-white px-4 py-3 flex gap-2">
      {/* Botón Atrás — oculto en el primer paso */}
      {currentStep > 0 && (
        <Button
          variant="secondary"
          size="md"
          onClick={onPrev}
          disabled={isLoading}
          className="flex-1"
          aria-label="Volver al paso anterior"
        >
          ← Atrás
        </Button>
      )}
 
      {/* Botón principal: Siguiente o Guardar borrador */}
      {last ? (
        <Button
          variant="primary"
          size="md"
          isLoading={isLoading}
          onClick={onSave}
          fullWidth={currentStep === 0}
          className="flex-2"
          style={{ background: '#3b5630' }}
          aria-label="Guardar evento como borrador"
        >
          {isLoading ? 'Guardando...' : '✓ Guardar borrador'}
        </Button>
      ) : (
        <Button
          variant="primary"
          size="md"
          onClick={onNext}
          fullWidth={currentStep === 0}
          className="flex-2"
          aria-label="Ir al siguiente paso"
        >
          Siguiente →
        </Button>
      )}
    </div>
  );
}