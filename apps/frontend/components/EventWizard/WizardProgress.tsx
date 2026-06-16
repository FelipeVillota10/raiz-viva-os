// views/components/events/wizard/WizardProgress.tsx
'use client';
 
import React from 'react';
import type { WIZARD_STEPS } from '@/hooks/events/useEventWizard';
 
interface Props {
  currentStep: number;
  totalSteps:  number;
  steps:       typeof WIZARD_STEPS;
}
 
export function WizardProgress({ currentStep, totalSteps, steps }: Props) {
  const progressPct = ((currentStep + 1) / totalSteps) * 100;
 
  return (
    <div className="bg-[#3b5630] px-4 pt-4 pb-3 flex flex-col gap-2">
 
      {/* Título del paso activo */}
      <div className="flex items-center justify-between">
        <h1 className="text-white text-sm font-medium">
          {steps[currentStep].title}
        </h1>
        <span className="text-white/60 text-xs">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>
 
      {/* Subtítulo */}
      <p className="text-white/70 text-xs">
        {steps[currentStep].subtitle}
      </p>
 
      {/* Barra de progreso */}
      <div
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Paso ${currentStep + 1} de ${totalSteps}`}
        className="w-full h-1 bg-white/20 rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-white rounded-full transition-all duration-400 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>
 
      {/* Dots de pasos */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={[
              'rounded-full transition-all duration-300',
              i === currentStep
                ? 'bg-white w-5 h-1.5'
                : i < currentStep
                  ? 'bg-white/60 w-1.5 h-1.5'
                  : 'bg-white/25 w-1.5 h-1.5',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  );
}