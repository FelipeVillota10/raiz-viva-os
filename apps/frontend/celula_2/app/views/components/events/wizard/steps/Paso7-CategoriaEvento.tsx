// views/components/events/wizard/steps/Step7Category.tsx
'use client';
 
import React from 'react';
import { EVENT_CATEGORIES } from '@/app/models/event.model';
import type { WizardFormData, StepErrors } from '@/app/viewmodels/events/useEventWizard';
 
interface Props {
  formData:    WizardFormData;
  errors:      StepErrors;
  updateField: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void;
}
 
export function Step7Category({ formData, errors, updateField }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-[#6b7a63]">
        Selecciona la categoría que mejor describe tu evento.
        {/* TODO: Reemplazar EVENT_CATEGORIES con GET /api/categories cuando C1 exponga el endpoint */}
      </p>
 
      {/* Grid de chips */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Categorías del evento">
        {EVENT_CATEGORIES.map((cat) => {
          const isSelected = formData.category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => updateField('category', isSelected ? '' : cat)}
              aria-pressed={isSelected}
              className={[
                'px-4 py-2 rounded-full text-sm border transition-all duration-200',
                isSelected
                  ? 'bg-[#557149] border-[#557149] text-white font-medium'
                  : 'bg-[#f4ede0] border-[#c9d4be] text-[#6b7a63] hover:border-[#8c9a80]',
              ].join(' ')}
            >
              {cat}
            </button>
          );
        })}
      </div>
 
      {/* Error */}
      {errors.category && (
        <p className="text-xs text-red-500 font-medium">{errors.category}</p>
      )}
 
      {/* Categoría seleccionada */}
      {formData.category && (
        <div className="bg-[#f4ede0] rounded-xl px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs text-[#6b7a63]">Categoría elegida:</span>
          <span className="text-sm font-medium text-[#557149]">{formData.category}</span>
        </div>
      )}
    </div>
  );
}