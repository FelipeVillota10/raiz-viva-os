// views/components/events/wizard/steps/Step3DateTime.tsx
'use client';
 
import React from 'react';
import { Input } from '@/components/shared/Input';
import type { WizardFormData, StepErrors } from '@/hooks/events/useEventWizard';
 
interface Props {
  formData:    WizardFormData;
  errors:      StepErrors;
  updateField: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void;
}
 
export function Step3DateTime({ formData, errors, updateField }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Fecha y hora de inicio */}
      <p className="text-xs font-medium text-[#557149]">Inicio del evento</p>
 
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Fecha de inicio"
          required
          type="date"
          value={formData.startDate}
          error={errors.startDate}
          onChange={(e) => updateField('startDate', e.target.value)}
        />
        <Input
          label="Hora de inicio"
          type="time"
          value={formData.startTime}
          onChange={(e) => updateField('startTime', e.target.value)}
        />
      </div>
 
      {/* Separador */}
      <div className="border-t border-[#c9d4be]" />
 
      {/* Fecha y hora de fin */}
      <p className="text-xs font-medium text-[#6b7a63]">Fin del evento (opcional)</p>
 
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Fecha de fin"
          type="date"
          value={formData.endDate}
          error={errors.endDate}
          min={formData.startDate}
          onChange={(e) => updateField('endDate', e.target.value)}
        />
        <Input
          label="Hora de fin"
          type="time"
          value={formData.endTime}
          onChange={(e) => updateField('endTime', e.target.value)}
        />
      </div>
    </div>
  );
}