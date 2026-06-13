/**
 * Formulario de registro turista
 * @celula - Celula1
 * Componente de presentación que utiliza useTuristaRegistro como ViewModel.
 *
 * Responsabilidades:
 *  - Renderizar el formulario de registro
 *  - Delegar toda la lógica de validación y envío al hook
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/base/Button';
import { Input, Select } from '@/components/ui/base/Input';
import { UserIcon, MailIcon, LockIcon, PhoneIcon } from '@/components/ui/base/Icons';
import { useTuristaRegistro } from '@/hooks/useTuristaRegistro';

function PreferencesFieldIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function DollarCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </svg>
  );
}

export function TuristaForm() {
  const {
    formData,
    errors,
    generalError,
    isLoading,
    monedaOptions,
    monedasStatus,
    turistaTipoId,
    tiposError,
    preferenciaOptions,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useTuristaRegistro();

  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm p-6 sm:p-8 lg:p-10">
      <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
        {tiposError && (
          <div className="p-4 bg-[#E53935]/10 border border-[#E53935] rounded-xl text-center">
            <p className="text-[#E53935] font-medium">
              No se pudo cargar el rol &quot;turista&quot; desde el servidor. Revisa la URL del API y que el backend esté activo.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <Input
            label="Nombre"
            name="nombre_completo"
            value={formData.nombre_completo}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.nombre_completo}
            icon={<UserIcon size={20} />}
            placeholder="Ingresa tu nombre completo"
            autoComplete="name"
          />
          <Input
            label="Correo"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            icon={<MailIcon size={20} />}
            placeholder="Ingresa tu correo electrónico"
            autoComplete="email"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <Input
            label="Contraseña"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            icon={<LockIcon size={20} />}
            placeholder="Ingrese su contraseña"
            autoComplete="new-password"
          />
          <Input
            label="Teléfono"
            name="telefono"
            type="tel"
            value={formData.telefono}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.telefono}
            icon={<PhoneIcon size={20} />}
            placeholder="Ingresa tu número telefónico"
            autoComplete="tel"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <Select
            label="Preferencias"
            name="preferencias"
            value={formData.preferencias}
            onChange={handleChange}
            options={preferenciaOptions}
            icon={<PreferencesFieldIcon size={20} />}
          />
          <Select
            label="Tipo de moneda"
            name="id_tipo_moneda"
            value={formData.id_tipo_moneda}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.id_tipo_moneda}
            options={monedaOptions}
            icon={<DollarCircleIcon size={20} />}
            disabled={monedasStatus === 'loading'}
          />
        </div>

        {generalError && (
          <div className="p-4 bg-[#E53935]/10 border border-[#E53935] rounded-xl text-center">
            <p className="text-[#E53935] font-medium">{generalError}</p>
          </div>
        )}

        <div className="flex justify-center pt-2 lg:pt-4">
          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            disabled={turistaTipoId == null}
            className="w-full sm:w-auto min-w-[280px] lg:min-w-[320px] uppercase tracking-wide text-base lg:text-lg"
          >
            Finalizar registro
          </Button>
        </div>
      </form>
    </div>
  );
}
