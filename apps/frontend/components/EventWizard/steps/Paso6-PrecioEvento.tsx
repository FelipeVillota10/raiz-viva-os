// views/components/events/wizard/steps/Step6Pricing.tsx
'use client';
 
import React from 'react';
import { Input } from '@/components/shared/Input';
import { SUPPORTED_CURRENCIES } from '@/models/event.model';
import type { WizardFormData, StepErrors } from '@/hooks/events/useEventWizard';
 
interface Props {
  formData:    WizardFormData;
  errors:      StepErrors;
  updateField: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void;
}
 
export function Step6Pricing({ formData, errors, updateField }: Props) {
  const isPaid = formData.pricingType === 'paid';
 
  return (
    <div className="flex flex-col gap-5">
 
      {/* Toggle gratuito / pago */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-[#2c3a26]">
          Tipo de acceso <span className="text-[#557149]">*</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(['free', 'paid'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                updateField('pricingType', type);
                if (type === 'free') updateField('price', '');
              }}
              className={[
                'py-2.5 px-4 rounded-xl border text-sm font-medium transition-all duration-200',
                formData.pricingType === type
                  ? 'bg-[#557149] border-[#557149] text-white'
                  : 'bg-[#f4ede0] border-[#c9d4be] text-[#6b7a63] hover:border-[#8c9a80]',
              ].join(' ')}
            >
              {type === 'free' ? '🎟 Gratuito' : '💰 De pago'}
            </button>
          ))}
        </div>
      </div>
 
      {/* Precio (solo si es pago) */}
      {isPaid ? (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-[#2c3a26]">
            Precio <span className="text-[#557149]">*</span>
          </p>
          <div className="flex gap-2">
            {/* Selector de divisa */}
            <select
              value={formData.currency}
              onChange={(e) => updateField('currency', e.target.value)}
              aria-label="Seleccionar divisa"
              className="w-24 shrink-0 rounded-lg px-2 py-2.5 text-sm bg-[#f4ede0] border border-[#c9d4be] focus:border-[#557149] outline-none text-[#2c3a26]"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
 
            {/* Valor */}
            <div className="flex-1">
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                error={errors.price}
                onChange={(e) => updateField('price', e.target.value)}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#f4ede0] rounded-xl p-3 text-xs text-[#6b7a63] flex items-start gap-2">
          <span className="text-[#8c9a80] text-base">ℹ</span>
          El evento será de acceso gratuito. El precio se registrará como 0.
        </div>
      )}
 
      {/* Capacidad */}
      <Input
        label="Capacidad / Stock"
        required
        type="number"
        min="1"
        placeholder="Ej: 200"
        value={formData.capacity}
        error={errors.capacity}
        hint="Número máximo de asistentes permitidos"
        onChange={(e) => updateField('capacity', e.target.value)}
      />
    </div>
  );
}