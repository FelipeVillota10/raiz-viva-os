// viewmodels/events/useEventWizard.ts
import { useState, useCallback } from 'react';
import { useCreateEvent } from './useCreateEvent';
import type { WizardFormData, StepErrors } from './event.types';

export type { WizardFormData, StepErrors };

export const WIZARD_STEPS = [
  { title: 'Imagen del evento',   subtitle: 'Sube una foto atractiva para tu evento' },
  { title: 'Nombre del evento',   subtitle: 'Dale un nombre a tu evento' },
  { title: 'Fecha y hora',        subtitle: 'Cuándo se realizará el evento' },
  { title: 'Ubicación',           subtitle: 'Dónde se llevará a cabo' },
  { title: 'Descripción',         subtitle: 'Cuéntale al público de qué trata' },
  { title: 'Precio y capacidad',  subtitle: 'Define el acceso y el aforo' },
  { title: 'Categoría',           subtitle: 'Clasifica tu evento para que sea encontrado' },
  { title: 'Revisión final',      subtitle: 'Revisa todo antes de guardar' },
] as const;

const INITIAL_FORM: WizardFormData = {
  imageFile:       null,
  imagePreviewUrl: null,
  name:            '',
  startDate:       '',
  startTime:       '',
  endDate:         '',
  endTime:         '',
  locationName:    '',
  locationAddress: '',
  description:     '',
  pricingType:     'free',
  price:           '',
  currency:        'COP',
  capacity:        '',
  category:        '',
};

function validateStep(step: number, data: WizardFormData): StepErrors {
  const errors: StepErrors = {};

  switch (step) {
    case 0:
      if (!data.imageFile && !data.imagePreviewUrl)
        errors.imageFile = 'La imagen del evento es obligatoria';
      break;

    case 1:
      if (!data.name.trim())
        errors.name = 'El nombre del evento es obligatorio';
      else if (data.name.trim().length < 3)
        errors.name = 'El nombre debe tener al menos 3 caracteres';
      else if (data.name.trim().length > 120)
        errors.name = 'El nombre no puede superar los 120 caracteres';
      break;

    case 2:
      if (!data.startDate)
        errors.startDate = 'La fecha de inicio es obligatoria';
      else if (data.endDate && data.endDate < data.startDate)
        errors.endDate = 'La fecha de fin no puede ser anterior al inicio';
      break;

    case 3:
      if (!data.locationName.trim())
        errors.locationName = 'El nombre del lugar es obligatorio';
      break;

    case 4:
      if (!data.description.trim())
        errors.description = 'La descripción es obligatoria';
      else if (data.description.trim().length < 20)
        errors.description = 'La descripción debe tener al menos 20 caracteres';
      break;

    case 5:
      if (data.pricingType === 'paid') {
        const price = parseFloat(data.price);
        if (!data.price || isNaN(price) || price <= 0)
          errors.price = 'Ingresa un precio válido mayor a 0';
      }
      const cap = parseInt(data.capacity, 10);
      if (!data.capacity || isNaN(cap) || cap < 1)
        errors.capacity = 'La capacidad debe ser un número entero positivo';
      break;

    case 6:
      if (!data.category)
        errors.category = 'Debes seleccionar una categoría';
      break;
  }

  return errors;
}

export function useEventWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData,    setFormData]    = useState<WizardFormData>(INITIAL_FORM);
  const [stepErrors,  setStepErrors]  = useState<StepErrors>({});

  const { createEvent, isLoading, submitError } = useCreateEvent();

  const totalSteps = WIZARD_STEPS.length;

  const updateField = useCallback(
    <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      setStepErrors((prev) => {
        if (prev[key]) {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return prev;
      });
    },
    [],
  );

  const nextStep = useCallback(() => {
    const errors = validateStep(currentStep, formData);
    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }
    setStepErrors({});
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  }, [currentStep, formData, totalSteps]);

  const prevStep = useCallback(() => {
    setStepErrors({});
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const saveAsDraft = useCallback(async () => {
    await createEvent(formData);
  }, [createEvent, formData]);

  return {
    currentStep,
    totalSteps,
    steps: WIZARD_STEPS,
    formData,
    stepErrors,
    isLoading,
    submitError,
    updateField,
    nextStep,
    prevStep,
    saveAsDraft,
  };
}