// views/components/events/wizard/CreateEventWizard.tsx
// Orquestador del formulario 
// Conecta el ViewModel (useEventWizard) con todos los Step y componentes del wizard.
 
'use client';
 
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
 
import { useEventWizard } from '@/hooks/events/useEventWizard';
import { WizardProgress }    from './WizardProgress';
import { WizardNavigation }  from './WizardNavigation';
import { Toast }             from '@/components/shared/Toast';
 
import { Step1ImageUpload }  from './steps/Paso1-SubirImagen';
import { Step2EventName }    from './steps/Paso2-NombreEvento';
import { Step3DateTime }     from './steps/Paso3-FechaEvento';
import { Step4Location }     from './steps/Paso4-UbicacionEvento';
import { Step5Description }  from './steps/Paso5-DescripcionEvento';
import { Step6Pricing }      from './steps/Paso6-PrecioEvento';
import { Step7Category }     from './steps/Paso7-CategoriaEvento';
import { Step8Review }       from './steps/Paso8-ResumenBorrador';
 
// Mapa de índice → componente del paso
// Si se añade un paso nuevo, solo se actualiza aquí y en WIZARD_STEPS del viewmodel
const STEP_COMPONENTS = [
  Step1ImageUpload,
  Step2EventName,
  Step3DateTime,
  Step4Location,
  Step5Description,
  Step6Pricing,
  Step7Category,
  Step8Review,
] as const;
 
export function CreateEventWizard() {
  const router = useRouter();
  const wizard = useEventWizard();
 
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType,    setToastType]    = useState<'success' | 'error'>('success');
 
  // El Step8Review no recibe updateField (solo lectura)
  // Los demás pasos reciben formData, errors y updateField
  const StepComponent = STEP_COMPONENTS[wizard.currentStep];
  const isReviewStep  = wizard.currentStep === wizard.totalSteps - 1;
 
  async function handleSave() {
    await wizard.saveAsDraft();
 
    if (wizard.submitError) {
      setToastMessage(wizard.submitError);
      setToastType('error');
      setToastVisible(true);
    } else {
      setToastMessage('El evento ha sido guardado en estado Borrador');
      setToastType('success');
      setToastVisible(true);
 
      // Redirigir a la lista de eventos después de 1.8 s
      setTimeout(() => {
      router.push('/actor/events');
      }, 1800);
    }
  }
 
  return (
    <>
      {/* Contenedor responsivo:
          - Móvil:   pantalla completa (min-h-screen)
          - Desktop: centrado con max-w y card elevada */}
      <div className="min-h-screen bg-[#f9f3e7] flex flex-col lg:items-center lg:justify-start lg:py-8 lg:px-4">
        <div className="
          w-full flex flex-col bg-white
          min-h-screen
          lg:min-h-0 lg:max-w-xl
          lg:rounded-2xl lg:border lg:border-[#c9d4be]
          lg:overflow-hidden lg:shadow-sm
        ">
 
          {/* Barra de progreso + header del paso */}
          <WizardProgress
            currentStep={wizard.currentStep}
            totalSteps={wizard.totalSteps}
            steps={wizard.steps}
          />
 
          {/* Contenido del paso activo */}
          <div className="flex-1 overflow-y-auto px-4 py-5">
            {isReviewStep ? (
              // Paso 8: solo lectura, recibe formData
              <Step8Review formData={wizard.formData} />
            ) : (
              // Pasos 1-7: reciben props para actualizar el formulario
              <StepComponent
                formData={wizard.formData}
                errors={wizard.stepErrors}
                updateField={wizard.updateField}
              />
            )}
          </div>
 
          {/* Botones de navegación */}
          <WizardNavigation
            currentStep={wizard.currentStep}
            totalSteps={wizard.totalSteps}
            isLoading={wizard.isLoading}
            onPrev={wizard.prevStep}
            onNext={wizard.nextStep}
            onSave={handleSave}
          />
        </div>
      </div>
 
      {/* Toast de confirmación */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastVisible(false)}
      />
    </>
  );
}