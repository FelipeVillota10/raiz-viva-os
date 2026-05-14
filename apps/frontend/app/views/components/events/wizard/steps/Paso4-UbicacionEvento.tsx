// views/components/events/wizard/steps/Paso4-UbicacionEvento.tsx
'use client';
 
import React from 'react';
import { Input } from '@/app/views/components/shared/Input';
import type { WizardFormData, StepErrors } from '@/app/viewmodels/events/useEventWizard';
 
interface Props {
  formData:    WizardFormData;
  errors:      StepErrors;
  updateField: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void;
}
 
export function Step4Location({ formData, errors, updateField }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Nombre del lugar"
        required
        value={formData.locationName}
        placeholder="Ej: Parque Central de Buitrera"
        error={errors.locationName}
        onChange={(e) => updateField('locationName', e.target.value)}
      />
 
      <Input
        label="Dirección (opcional)"
        value={formData.locationAddress}
        placeholder="Ej: Carrera 5 #12-34, Palmira"
        onChange={(e) => updateField('locationAddress', e.target.value)}
      />
 
      {/* Placeholder de mapa — preparado para integración futura */}
      <div
        aria-label="Sección de mapa — integración próxima"
        className="rounded-xl bg-[#e8eddf] border border-[#c9d4be] h-28 flex flex-col items-center justify-center gap-1"
      >
        <span className="text-2xl text-[#8c9a80]">⊕</span>
        <p className="text-xs text-[#6b7a63] text-center">
          Selección en mapa disponible próximamente
        </p>
      </div>
 
      <p className="text-[10px] text-[#6b7a63]">
        La integración con mapa se conectará con el módulo de territorio en una próxima versión.
      </p>
    </div>
  );
}