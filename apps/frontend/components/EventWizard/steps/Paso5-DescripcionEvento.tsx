// views/components/events/wizard/steps/Step5Description.tsx
'use client';
 
import React from 'react';
import { Textarea } from '@/components/shared/Input';
import type { WizardFormData, StepErrors } from '@/hooks/events/useEventWizard';
 
interface Props {
  formData:    WizardFormData;
  errors:      StepErrors;
  updateField: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void;
}
 
const MAX_DESC = 1000;
 
export function Step5Description({ formData, errors, updateField }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Textarea
        label="Descripción del evento"
        required
        rows={6}
        maxLength={MAX_DESC}
        value={formData.description}
        placeholder="Describe la experiencia, actividades, qué incluye el evento, a quién va dirigido..."
        error={errors.description}
        charCount={{ current: formData.description.length, max: MAX_DESC }}
        onChange={(e) => updateField('description', e.target.value)}
      />
 
      {/* Progreso de caracteres mínimos */}
      {formData.description.length < 20 && formData.description.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded bg-[#c9d4be] overflow-hidden">
            <div
              className="h-1 rounded bg-[#8c9a80] transition-all duration-300"
              style={{ width: `${(formData.description.length / 20) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-[#6b7a63]">
            Mínimo 20 caracteres
          </span>
        </div>
      )}
    </div>
  );
}