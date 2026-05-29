// views/components/events/wizard/steps/Step2EventName.tsx
'use client';
 
import React from 'react';
import { Input } from '@/app/views/components/shared/Input';
import type { WizardFormData, StepErrors } from '@/app/viewmodels/events/useEventWizard';
 
interface Props {
  formData:    WizardFormData;
  errors:      StepErrors;
  updateField: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void;
}
 
const MAX_NAME = 120;
 
export function Step2EventName({ formData, errors, updateField }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Nombre del evento"
        required
        value={formData.name}
        maxLength={MAX_NAME}
        placeholder="Ej: Festival del Cacao 2026"
        error={errors.name}
        onChange={(e) => updateField('name', e.target.value)}
      />
      <p className="text-[10px] text-right text-[#6b7a63] -mt-3">
        {formData.name.length} / {MAX_NAME}
      </p>
 
      <div className="bg-[#f4ede0] rounded-xl p-3 text-xs text-[#6b7a63]">
        <p className="font-medium text-[#557149] mb-1">Consejos</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Usa un nombre descriptivo y memorable</li>
          <li>Incluye el año si es un evento recurrente</li>
          <li>Máximo {MAX_NAME} caracteres</li>
        </ul>
      </div>
    </div>
  );
}