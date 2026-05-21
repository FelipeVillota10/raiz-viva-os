'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { UserIcon, MailIcon, LockIcon, PhoneIcon } from '../../components/ui/Icons';
import { HeaderSecundario } from '../../components/HeaderSecundario';
import { Footer } from '../../components/Footer';
import { Servicio } from '../../models/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FormData {
  nombre_completo: string;
  email: string;
  password: string;
  id_territorio: string;
  id_tipo_moneda: string;
  telefono: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function ClientePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [formData, setFormData] = useState<FormData>({
    nombre_completo: '',
    email: '',
    password: '',
    id_territorio: '',
    id_tipo_moneda: '',
    telefono: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [territorioOptions, setTerritorioOptions] = useState<{ value: string; label: string }[]>([
    { value: '', label: 'Cargando territorios...' },
  ]);
  const [monedaOptions, setMonedaOptions] = useState<{ value: string; label: string }[]>([
    { value: '', label: 'Cargando...' },
  ]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [serviciosOptions, setServiciosOptions] = useState<Servicio[]>([]);
  const [selectedServicios, setSelectedServicios] = useState<number[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('selected_roles');
    if (stored) {
      try {
        const roles = JSON.parse(stored);
        if (Array.isArray(roles)) {
          setSelectedRoles(roles);
        }
      } catch {
      }
    }

    const fetchOptions = async () => {
      try {
        const [territoriosRes, monedasRes, serviciosRes] = await Promise.all([
          fetch(`${API_URL}/api/territorios/`),
          fetch(`${API_URL}/api/monedas/`),
          fetch(`${API_URL}/api/servicios/`),
        ]);

        if (territoriosRes.ok) {
          const territorios = await territoriosRes.json();
          setTerritorioOptions([
            { value: '', label: 'Seleccione un territorio' },
            ...territorios.map((t: { id_territorio: number; nombre_territorio: string }) => ({
              value: String(t.id_territorio),
              label: t.nombre_territorio,
            })),
          ]);
        }

        if (monedasRes.ok) {
          const monedas = await monedasRes.json();
          setMonedaOptions([
            { value: '', label: 'Seleccione una moneda' },
            ...monedas.map((m: { id: number; nombre: string }) => ({
              value: String(m.id),
              label: `${m.nombre}`,
            })),
          ]);
        }

        if (serviciosRes.ok) {
          const servicios = await serviciosRes.json();
          setServiciosOptions(servicios);
        }
      } catch {
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const toggleServicio = (id: number) => {
    setSelectedServicios(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'nombre_completo':
        if (value.length < 3) return 'El nombre del negocio debe tener al menos 3 caracteres.';
        return null;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Ingrese un correo electrónico válido.';
        return null;
      case 'password':
        if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
        if (!/[A-Z]/.test(value)) return 'La contraseña debe contener al menos una mayúscula.';
        if (!/\d/.test(value)) return 'La contraseña debe contener al menos un número.';
        return null;
      case 'telefono':
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length < 7 || digitsOnly.length > 15) return 'El teléfono debe tener entre 7 y 15 dígitos.';
        if (!/^\d+$/.test(digitsOnly)) return 'El teléfono solo puede contener números.';
        return null;
      case 'id_territorio':
        if (!value) return 'Seleccione un territorio.';
        return null;
      case 'id_tipo_moneda':
        if (!value) return 'Seleccione una moneda.';
        return null;
      default:
        return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'telefono') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    const error = validateField(name, name === 'telefono' ? value.replace(/\D/g, '') : value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) newErrors[name] = error;
      else delete newErrors[name];
      return newErrors;
    });
    setGeneralError(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, name === 'telefono' ? value.replace(/\D/g, '') : value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) newErrors[name] = error;
      else delete newErrors[name];
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const newErrors: FormErrors = {};
    (Object.keys(formData) as Array<keyof FormData>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        nombre_completo: formData.nombre_completo,
        email: formData.email,
        password: formData.password,
        id_territorio: formData.id_territorio ? parseInt(formData.id_territorio) : null,
        id_tipo_moneda: formData.id_tipo_moneda ? parseInt(formData.id_tipo_moneda) : null,
        telefono: formData.telefono,
        tipos_actores: selectedRoles,
        servicios: selectedServicios,
        es_actor: true,
        es_lider: false,
        es_turista: false,
      };
      console.log('Datos enviados:', payload);
      const response = await fetch(`${API_URL}/api/registro/cliente/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/registro/confirmacion');
      } else {
        console.error('Respuesta completa del backend:', data);
        if (data.errores) {
          const backendErrors: FormErrors = {};
          Object.entries(data.errores).forEach(([field, messages]) => {
            if (Array.isArray(messages)) backendErrors[field] = messages[0] as string;
          });
          setErrors(backendErrors);
        }
        if (data.error) setGeneralError(data.error);
        if (data.detail) setGeneralError(data.detail);
      }
    } catch (error) {
      setGeneralError('Error de conexión. Asegúrate de que el backend esté corriendo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
      <HeaderSecundario backRoute="/registro" title="Registro Actor Territorial" />

      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-10 lg:py-14">
        <div className="max-w-5xl mx-auto">
          <header className="text-center lg:text-left mb-8 lg:mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#231F20] tracking-tight">
              Registro del Actor Territorial
            </h1>
            <p className="mt-2 text-lg text-[#353535] max-w-2xl mx-auto lg:mx-0">
              Complete el formulario para registrar su negocio en la red.
            </p>
          </header>

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
        </div>
      </main>

      <Footer />
    </div>
  );
}