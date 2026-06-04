"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useEventWizard } from "@/app/viewmodels/events/useEventWizard";
import { useEditEvent } from "@/app/viewmodels/events/useEditEvent";
import { WizardProgress } from "./WizardProgress";
import { WizardNavigation } from "./WizardNavigation";
import { Toast } from "@/app/views/components/shared/Toast";
import { StatusBadge } from "@/app/views/components/shared/StatusBadge";
import { PublishConfirmModal } from "@/app/views/components/events/PublishConfirmModal";
import { DeactivateConfirmModal } from "@/app/views/components/events/DeactivateConfirmModal";
import type { WizardFormData } from "@/app/viewmodels/events/useEventWizard";

import { Step1ImageUpload } from "./steps/Paso1-SubirImagen";
import { Step2EventName } from "./steps/Paso2-NombreEvento";
import { Step3DateTime } from "./steps/Paso3-FechaEvento";
import { Step4Location } from "./steps/Paso4-UbicacionEvento";
import { Step5Description } from "./steps/Paso5-DescripcionEvento";
import { Step6Pricing } from "./steps/Paso6-PrecioEvento";
import { Step7Category } from "./steps/Paso7-CategoriaEvento";
import { Step8Review } from "./steps/Paso8-ResumenBorrador";

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

interface Props {
  eventId: string;
}

export function EditEventWizard({ eventId }: Props) {
  const router = useRouter();
  const wizard = useEventWizard();
  const editor = useEditEvent();

  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<
    "draft" | "pending" | "active" | "inactive"
  >("draft");

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [showPublish, setShowPublish] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);

  // Precargar datos del evento al montar
  useEffect(() => {
    async function load() {
      const data = await editor.loadEvent(eventId);
      if (data) {
        (
          Object.entries(data) as [
            keyof WizardFormData,
            WizardFormData[keyof WizardFormData],
          ][]
        ).forEach(([key, value]) => {
          wizard.updateField(key, value);
        });
        setLoaded(true);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const StepComponent = STEP_COMPONENTS[wizard.currentStep];
  const isReviewStep = wizard.currentStep === wizard.totalSteps - 1;

  // Guardar cambios
  async function handleSave() {
    await editor.updateEvent(eventId, wizard.formData);
    if (editor.submitError) {
      setToastMessage(editor.submitError);
      setToastType("error");
    } else {
      setToastMessage("Cambios guardados correctamente");
      setToastType("success");
    }
    setToastVisible(true);
  }

  // Publicar evento
  async function handlePublish() {
    await editor.updateEvent(eventId, { ...wizard.formData });
    setShowPublish(false);
    setStatus("pending");
    setToastMessage("Evento enviado a revision. Estado: Pendiente");
    setToastType("success");
    setToastVisible(true);
  }

  // Inactivar evento
  async function handleDeactivate() {
    setShowDeactivate(false);
    setStatus("inactive");
    setToastMessage("Evento inactivado correctamente");
    setToastType("success");
    setToastVisible(true);
    setTimeout(() => router.push("/actor/events"), 1800);
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#f9f3e7] flex items-center justify-center">
        <p className="text-sm text-[#6b7a63]">Cargando evento...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#f9f3e7] flex flex-col lg:items-center lg:justify-start lg:py-8 lg:px-4">
        <div
          className="
          w-full flex flex-col bg-white
          min-h-screen
          lg:min-h-0 lg:max-w-xl
          lg:rounded-2xl lg:border lg:border-[#c9d4be]
          lg:overflow-hidden lg:shadow-sm
        "
        >
          {/* Header con estado y acciones */}
          <div className="bg-[#f4ede0] px-4 py-3 flex items-center justify-between border-b border-[#c9d4be]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6b7a63]">Estado:</span>
              <StatusBadge status={status} />
            </div>
            <div className="flex gap-2">
              {(status === "draft" || status === "pending") && (
                <button
                  onClick={() => setShowDeactivate(true)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  Inactivar
                </button>
              )}
              {status === "draft" && (
                <button
                  onClick={() => setShowPublish(true)}
                  className="text-xs bg-[#557149] text-white px-3 py-1 rounded-lg font-medium hover:bg-[#3b5630] transition-colors"
                >
                  Publicar
                </button>
              )}
            </div>
          </div>

          <WizardProgress
            currentStep={wizard.currentStep}
            totalSteps={wizard.totalSteps}
            steps={wizard.steps}
          />

          <div className="flex-1 overflow-y-auto px-4 py-5">
            {isReviewStep ? (
              <Step8Review formData={wizard.formData} />
            ) : (
              <StepComponent
                formData={wizard.formData}
                errors={wizard.stepErrors}
                updateField={wizard.updateField}
              />
            )}
          </div>

          <WizardNavigation
            currentStep={wizard.currentStep}
            totalSteps={wizard.totalSteps}
            isLoading={editor.isLoading}
            onPrev={wizard.prevStep}
            onNext={wizard.nextStep}
            onSave={handleSave}
          />
        </div>
      </div>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastVisible(false)}
      />

      <PublishConfirmModal
        visible={showPublish}
        eventName={wizard.formData.name}
        onConfirm={handlePublish}
        onClose={() => setShowPublish(false)}
        isLoading={editor.isLoading}
      />

      <DeactivateConfirmModal
        visible={showDeactivate}
        eventName={wizard.formData.name}
        onConfirm={handleDeactivate}
        onClose={() => setShowDeactivate(false)}
        isLoading={editor.isLoading}
      />
    </>
  );
}
