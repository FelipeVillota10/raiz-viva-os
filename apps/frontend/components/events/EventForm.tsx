'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Toast } from '@/components/shared/Toast';
import { EventSummaryModal } from '@/components/events/EventSummaryModal';
import { useCategoriasViewModel } from '@/hooks/events/useCategoriasViewModel';
import { useMonedas } from '@/hooks/shared/useMonedas';
import { useTerritorios } from '@/hooks/shared/useTerritorios';
import { type EventDataPayload } from '@/services/eventosService';
import { IMAGE_CONFIG } from '@/models/event.model';

interface Props {
  initialData?: EventDataPayload;
  onSubmit: (data: EventDataPayload) => Promise<void>;
  isLoading: boolean;
  isEditMode?: boolean;
}

const DEFAULT_DATA: EventDataPayload = {
  name: '',
  description: '',
  category: '',
  pricingType: 'free',
  price: '',
  currency: '',
  capacity: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  locationId: '',
  imageFile: null,
  imagePreviewUrl: null,
};

export function EventForm({ initialData, onSubmit, isLoading, isEditMode = false }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<EventDataPayload>(initialData || DEFAULT_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof EventDataPayload, string>>>({});
  
  const [showSummary, setShowSummary] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const { categorias, isLoading: loadingCat } = useCategoriasViewModel();
  const { monedas, isLoading: loadingMon } = useMonedas();
  const { territorios, isLoading: loadingTerr } = useTerritorios();

  const updateField = <K extends keyof EventDataPayload>(field: K, value: EventDataPayload[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!IMAGE_CONFIG.acceptedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, imageFile: 'Formato no soportado (solo JPG/PNG)' }));
      return;
    }
    if (file.size > IMAGE_CONFIG.maxSizeBytes) {
      setErrors(prev => ({ ...prev, imageFile: 'El archivo excede el límite de 5MB' }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, imageFile: file, imagePreviewUrl: previewUrl }));
    setErrors(prev => ({ ...prev, imageFile: undefined }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof EventDataPayload, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.category) newErrors.category = 'Selecciona una categoría';
    if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es requerida';
    if (!formData.capacity || Number(formData.capacity) <= 0) newErrors.capacity = 'Ingresa una capacidad válida';
    
    if (formData.pricingType === 'paid') {
      if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'El precio es requerido';
      if (!formData.currency) newErrors.currency = 'Selecciona la moneda';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReviewClick = () => {
    if (validateForm()) {
      setShowSummary(true);
    } else {
      setToastMessage('Por favor completa todos los campos requeridos correctamente.');
      setToastVisible(true);
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      await onSubmit(formData);
      setShowSummary(false);
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'Error al guardar');
      setToastVisible(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#c9d4be] shadow-sm flex flex-col h-full lg:h-auto overflow-hidden">
      <div className="p-4 border-b border-[#c9d4be] bg-[#f4ede0] flex items-center justify-between">
        <h2 className="font-semibold text-[#2c3a26]">
          {isEditMode ? 'Editar Evento' : 'Crear Nuevo Evento'}
        </h2>
        <Button variant="secondary" size="sm" onClick={() => router.push('/actor/events')}>
          Cancelar
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
        
        {/* Sección: Portada */}
        <section>
          <h3 className="text-sm font-semibold text-[#557149] mb-3">1. Portada del Evento</h3>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative w-full aspect-video rounded-xl border-2 border-dashed 
              flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors
              ${errors.imageFile ? 'border-red-300 bg-red-50' : 'border-[#c9d4be] bg-[#f9f3e7] hover:bg-[#f4ede0]'}
            `}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept={IMAGE_CONFIG.acceptString}
              className="hidden" 
            />
            {formData.imagePreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={formData.imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <p className="text-sm font-medium text-[#557149]">Haz clic para subir portada</p>
                <p className="text-xs text-[#6b7a63] mt-1">JPG o PNG, máx. 5MB</p>
              </div>
            )}
          </div>
          {errors.imageFile && <p className="text-xs text-red-500 mt-1">{errors.imageFile}</p>}
        </section>

        {/* Sección: Información Básica */}
        <section>
          <h3 className="text-sm font-semibold text-[#557149] mb-3">2. Información Básica</h3>
          <div className="flex flex-col gap-4">
            <Input
              label="Nombre del Evento"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              error={errors.name}
              placeholder="Ej. Taller de Cerámica"
            />
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#2c3a26] ml-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className={`
                  w-full px-4 py-3 bg-[#f9f3e7] border rounded-xl outline-none transition-all duration-200 text-sm
                  ${errors.description ? 'border-red-300' : 'border-[#c9d4be] focus:border-[#8c9a80] focus:ring-2 focus:ring-[#c9d4be]/30'}
                `}
                rows={4}
                placeholder="Detalla lo que vivirán los asistentes..."
              />
              {errors.description && <p className="text-xs text-red-500 ml-1">{errors.description}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#2c3a26] ml-1">Categoría</label>
              {loadingCat ? (
                <p className="text-xs text-[#6b7a63]">Cargando...</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categorias.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => updateField('category', formData.category === cat.id ? '' : cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                        formData.category === cat.id 
                          ? 'bg-[#557149] text-white border-[#557149]' 
                          : 'bg-[#f4ede0] text-[#6b7a63] border-[#c9d4be] hover:border-[#8c9a80]'
                      }`}
                    >
                      {cat.nombre}
                    </button>
                  ))}
                </div>
              )}
              {errors.category && <p className="text-xs text-red-500 ml-1">{errors.category}</p>}
            </div>
          </div>
        </section>

        {/* Sección: Cuándo y Dónde */}
        <section>
          <h3 className="text-sm font-semibold text-[#557149] mb-3">3. Cuándo y Dónde</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha de Inicio"
              type="date"
              value={formData.startDate}
              onChange={(e) => updateField('startDate', e.target.value)}
              error={errors.startDate}
            />
            <Input
              label="Hora de Inicio (opcional)"
              type="time"
              value={formData.startTime}
              onChange={(e) => updateField('startTime', e.target.value)}
            />
            <Input
              label="Fecha de Fin (opcional)"
              type="date"
              value={formData.endDate}
              onChange={(e) => updateField('endDate', e.target.value)}
              min={formData.startDate}
            />
            <Input
              label="Hora de Fin (opcional)"
              type="time"
              value={formData.endTime}
              onChange={(e) => updateField('endTime', e.target.value)}
            />
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-sm font-medium text-[#2c3a26] ml-1">Lugar (Territorio)</label>
              <select
                value={formData.locationId}
                onChange={(e) => updateField('locationId', e.target.value)}
                className="w-full px-4 py-3 bg-[#f9f3e7] border border-[#c9d4be] rounded-xl outline-none text-sm transition-all focus:border-[#8c9a80]"
              >
                <option value="">Selecciona un territorio (opcional)</option>
                {!loadingTerr && territorios.map(t => (
                  <option key={t.id_territorio} value={t.id_territorio}>{t.nombre_territorio}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Sección: Entradas y Capacidad */}
        <section>
          <h3 className="text-sm font-semibold text-[#557149] mb-3">4. Entradas y Capacidad</h3>
          <div className="flex flex-col gap-4">
            <Input
              label="Capacidad (Número de personas)"
              type="number"
              value={formData.capacity}
              onChange={(e) => updateField('capacity', e.target.value)}
              error={errors.capacity}
              placeholder="Ej. 50"
            />

            <div className="flex gap-2">
              {(['free', 'paid'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    updateField('pricingType', type);
                    if (type === 'free') {
                      updateField('price', '');
                      updateField('currency', '');
                    }
                  }}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    formData.pricingType === type 
                      ? 'bg-[#557149] text-white border-[#557149]' 
                      : 'bg-[#f4ede0] text-[#6b7a63] border-[#c9d4be]'
                  }`}
                >
                  {type === 'free' ? 'Entrada Gratuita' : 'Evento Pago'}
                </button>
              ))}
            </div>

            {formData.pricingType === 'paid' && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Precio"
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  error={errors.price}
                  placeholder="0.00"
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#2c3a26] ml-1">Moneda</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => updateField('currency', e.target.value)}
                    className={`
                      w-full px-4 py-3 bg-[#f9f3e7] border rounded-xl outline-none text-sm transition-all
                      ${errors.currency ? 'border-red-300' : 'border-[#c9d4be] focus:border-[#8c9a80]'}
                    `}
                  >
                    <option value="">Selecciona...</option>
                    {!loadingMon && monedas.map(m => (
                      <option key={m.id} value={m.id}>{m.simbolo}</option>
                    ))}
                  </select>
                  {errors.currency && <p className="text-xs text-red-500 ml-1">{errors.currency}</p>}
                </div>
              </div>
            )}
          </div>
        </section>

      </div>

      <div className="p-4 border-t border-[#c9d4be] bg-white flex justify-end">
        <Button variant="primary" onClick={handleReviewClick}>
          Revisar y Guardar
        </Button>
      </div>

      <EventSummaryModal
        visible={showSummary}
        onClose={() => setShowSummary(false)}
        data={formData}
        onConfirm={handleConfirmSubmit}
        confirmText={isEditMode ? 'Guardar Cambios' : 'Crear Evento'}
        isLoading={isLoading}
      />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type="error"
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}
