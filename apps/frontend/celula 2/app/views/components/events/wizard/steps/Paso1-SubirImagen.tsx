//views/components/events/wizard/steps/Paso1-SubirImagen.tsx
'use client';
 
import React, { useRef } from 'react';
import type { WizardFormData, StepErrors } from '@/app/viewmodels/events/useEventWizard';
import { IMAGE_CONFIG } from '@/app/models/event.model';
 
interface Props {
  formData:    WizardFormData;
  errors:      StepErrors;
  updateField: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void;
}
 
export function Step1ImageUpload({ formData, errors, updateField }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
 
  function handleFile(file: File) {
    // Validar tipo
    if (!IMAGE_CONFIG.acceptedTypes.includes(file.type)) {
      updateField('imageFile', null);
      return;
    }
    // Validar tamaño
    if (file.size > IMAGE_CONFIG.maxSizeBytes) {
      updateField('imageFile', null);
      return;
    }
    // Crear preview URL
    const previewUrl = URL.createObjectURL(file);
    updateField('imageFile', file);
    updateField('imagePreviewUrl', previewUrl);
  }
 
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }
 
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }
 
  function handleRemove() {
    updateField('imageFile', null);
    updateField('imagePreviewUrl', null);
    if (inputRef.current) inputRef.current.value = '';
  }
 
  // Vista: imagen seleccionada
  if (formData.imagePreviewUrl) {
    return (
      <div className="flex flex-col gap-3">
        {/* Preview */}
        <div className="relative rounded-xl overflow-hidden bg-[#f4ede0] aspect-video w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={formData.imagePreviewUrl}
            alt="Vista previa del evento"
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleRemove}
            aria-label="Eliminar imagen"
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>
 
        {/* Info del archivo */}
        <div className="flex items-center gap-3 bg-[#f4ede0] rounded-lg px-3 py-2.5">
          <span className="text-[#557149] text-lg">✓</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#2c3a26] truncate">
              {formData.imageFile?.name ?? 'Imagen cargada'}
            </p>
            {formData.imageFile && (
              <p className="text-[10px] text-[#6b7a63]">
                {(formData.imageFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>
          <button
            onClick={handleRemove}
            className="text-xs text-[#6b7a63] hover:text-red-500 transition-colors underline"
          >
            Cambiar
          </button>
        </div>
      </div>
    );
  }
 
  // Vista: zona de upload
  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Zona de carga de imagen. Haz clic o arrastra una imagen"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={[
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer',
          'transition-colors duration-200',
          errors.imageFile
            ? 'border-red-400 bg-red-50'
            : 'border-[#c9d4be] bg-[#f4ede0] hover:border-[#8c9a80]',
        ].join(' ')}
      >
        <div className="text-4xl mb-3 text-[#8c9a80]">↑</div>
        <p className="text-sm font-medium text-[#2c3a26] mb-1">
          Toca para seleccionar una imagen
        </p>
        <p className="text-xs text-[#6b7a63]">o arrastra y suelta aquí</p>
      </div>
 
      {/* Error */}
      {errors.imageFile && (
        <p className="text-xs text-red-500 font-medium -mt-2">{errors.imageFile}</p>
      )}
 
      {/* Requisitos */}
      <div className="flex gap-2">
        {['JPG', 'PNG', 'Máx. 5 MB'].map((item) => (
          <div
            key={item}
            className="flex-1 bg-[#f4ede0] rounded-lg py-2 text-center text-[10px] font-medium text-[#6b7a63]"
          >
            {item}
          </div>
        ))}
      </div>
 
      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_CONFIG.acceptString}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}