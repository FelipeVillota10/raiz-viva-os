/**
 * Formulario de registro actor territorial
 * @celula - Celula1
 * Componente de presentación que utiliza useActorTerritorialRegistro como ViewModel.
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
import { useActorTerritorialRegistro } from '@/hooks/useActorTerritorialRegistro';

export function ActorTerritorialForm() {
  const {
    formData,
    errors,
    generalError,
    isLoading,
    selectedServicios,
    territorioOptions,
    monedaOptions,
    serviciosOptions,
    handleChange,
    handleBlur,
    handleSubmit,
    toggleServicio,
  } = useActorTerritorialRegistro();

  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm p-6 sm:p-8 lg:p-10">
      <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <Input label="Nombre del Negocio" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} onBlur={handleBlur} error={errors.nombre_completo} icon={<UserIcon size={20} />} placeholder="Ej: Restaurante El Sabor" autoComplete="name" />
          <Input label="Correo Electrónico" name="email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} icon={<MailIcon size={20} />} placeholder="Ej: correo@ejemplo.com" autoComplete="email" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <Input label="Contraseña" name="password" type="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} error={errors.password} icon={<LockIcon size={20} />} placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número" autoComplete="new-password" />
          <Input label="Teléfono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} onBlur={handleBlur} error={errors.telefono} icon={<PhoneIcon size={20} />} placeholder="Ej: 3001234567" autoComplete="tel" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <Select label="Territorio" name="id_territorio" value={formData.id_territorio} onChange={handleChange} onBlur={handleBlur} error={errors.id_territorio} options={territorioOptions} />
          <Select label="Moneda de Preferencia" name="id_tipo_moneda" value={formData.id_tipo_moneda} onChange={handleChange} onBlur={handleBlur} error={errors.id_tipo_moneda} options={monedaOptions} />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#231F20]">
            Servicios que ofreces (opcional)
          </label>
          <div className="flex flex-wrap gap-2">
            {serviciosOptions.length === 0 ? (
              <p className="text-sm text-[#666]">Cargando servicios...</p>
            ) : (
              serviciosOptions.map((servicio) => (
                <button
                  key={servicio.id}
                  type="button"
                  onClick={() => toggleServicio(servicio.id)}
                  className={`px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                    selectedServicios.includes(servicio.id)
                      ? 'bg-[#3b5630] text-white border-[#3b5630]'
                      : 'bg-white text-[#353535] border-[#E8E4DC] hover:border-[#231F20]'
                  }`}
                >
                  {servicio.nombre}
                </button>
              ))
            )}
          </div>
        </div>

        {generalError && (
          <div className="p-4 bg-[#E53935]/10 border border-[#E53935] rounded-xl text-center">
            <p className="text-[#E53935] font-medium">{generalError}</p>
          </div>
        )}

        <div className="flex justify-center pt-2 lg:pt-4">
          <Button type="submit" size="lg" isLoading={isLoading} className="w-full sm:w-auto min-w-[280px] lg:min-w-[320px] uppercase tracking-wide text-base lg:text-lg">
            Finalizar Registro
          </Button>
        </div>
      </form>
    </div>
  );
}
