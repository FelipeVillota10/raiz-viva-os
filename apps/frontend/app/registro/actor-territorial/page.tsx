'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { ArrowLeftIcon, UserIcon, MailIcon, LockIcon, PhoneIcon, CalendarIcon } from '../../components/ui/Icons';

interface FormData {
  nombre_completo: string;
  email: string;
  password: string;
  nivel_formacion: string;
  servicios: string;
  sector: string;
  moneda: string;
  telefono: string;
  fecha_nacimiento: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function ActorTerritorialPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombre_completo: '',
    email: '',
    password: '',
    nivel_formacion: '',
    servicios: '',
    sector: '',
    moneda: 'COP',
    telefono: '',
    fecha_nacimiento: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const nivelFormacionOptions = [
    { value: 'basica', label: 'Básica' },
    { value: 'media', label: 'Media' },
    { value: 'tecnica', label: 'Técnica' },
    { value: 'universitaria', label: 'Universitaria' },
    { value: 'posgrado', label: 'Posgrado' },
  ];

  const sectorOptions = [
    { value: 'agro', label: 'Agro' },
    { value: 'turismo', label: 'Turismo' },
    { value: 'artesanias', label: 'Artesanías' },
    { value: 'gastronomia', label: 'Gastronomía' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'educacion', label: 'Educación' },
    { value: 'otro', label: 'Otro' },
  ];

  const monedaOptions = [
    { value: 'COP', label: 'Peso Colombiano (COP)' },
    { value: 'USD', label: 'Dólar Americano (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
  ];

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'nombre_completo':
        if (/\d/.test(value)) return 'El nombre no puede contener números.';
        if (value.trim().split(/\s+/).length < 2) return 'El nombre debe tener al menos 2 palabras.';
        if (value.length < 5) return 'El nombre debe tener al menos 5 caracteres.';
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
      case 'nivel_formacion':
        if (!value) return 'Seleccione un nivel de formación.';
        return null;
      case 'sector':
        if (!value) return 'Seleccione un sector.';
        return null;
      case 'moneda':
        if (!value) return 'Seleccione una moneda.';
        return null;
      default:
        return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      if (key !== 'fecha_nacimiento' && key !== 'servicios') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const rolesIds = [1, 2, 3, 4, 5];
      const response = await fetch('http://localhost:8000/api/registro/actor-territorial/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, roles: rolesIds }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/registro/confirmacion');
      } else {
        if (data.errores) {
          const backendErrors: FormErrors = {};
          Object.entries(data.errores).forEach(([field, messages]) => {
            if (Array.isArray(messages)) backendErrors[field] = messages[0] as string;
          });
          setErrors(backendErrors);
        }
        if (data.error) setGeneralError(data.error);
      }
    } catch (error) {
      setGeneralError('Error de conexión. Asegúrate de que el backend esté corriendo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA]">
      <header className="flex items-center gap-4 px-6 py-4 bg-[#EFF7EA] border-b border-[#E6D3A3]">
        <button onClick={() => router.push('/registro')} className="p-2 rounded-lg hover:bg-[#E6D3A3] transition-colors">
          <ArrowLeftIcon className="text-[#231F20]" />
        </button>
        <h1 className="text-xl font-semibold text-[#231F20]">Registro Actor Territorial</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold text-[#231F20] mb-2 text-center">
          Registro del Actor Territorial
        </h2>
        <p className="text-[#353535] mb-8 text-center">Complete todos los campos para crear su cuenta</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nombre Completo" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} onBlur={handleBlur} error={errors.nombre_completo} icon={<UserIcon size={20} />} placeholder="Ej: Juan Pérez García" autoComplete="name" />
            <Input label="Correo Electrónico" name="email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} icon={<MailIcon size={20} />} placeholder="Ej: correo@ejemplo.com" autoComplete="email" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Contraseña" name="password" type="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} error={errors.password} icon={<LockIcon size={20} />} placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número" autoComplete="new-password" />
            <Input label="Teléfono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} onBlur={handleBlur} error={errors.telefono} icon={<PhoneIcon size={20} />} placeholder="Ej: 3001234567" autoComplete="tel" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select label="Nivel de Formación" name="nivel_formacion" value={formData.nivel_formacion} onChange={handleChange} onBlur={handleBlur} error={errors.nivel_formacion} options={nivelFormacionOptions} />
            <Select label="Sector" name="sector" value={formData.sector} onChange={handleChange} onBlur={handleBlur} error={errors.sector} options={sectorOptions} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select label="Moneda de Preferencia" name="moneda" value={formData.moneda} onChange={handleChange} onBlur={handleBlur} error={errors.moneda} options={monedaOptions} />
            <Input label="Fecha de Nacimiento" name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleChange} icon={<CalendarIcon size={20} />} />
          </div>

          <Textarea label="Servicios / Detalle de productos (opcional)" name="servicios" value={formData.servicios} onChange={handleChange} placeholder="Describa los productos o servicios que ofrece..." rows={4} />

          {generalError && (
            <div className="p-4 bg-[#E53935]/10 border border-[#E53935] rounded-xl text-center">
              <p className="text-[#E53935] font-medium">{generalError}</p>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <Button type="submit" size="lg" isLoading={isLoading} className="px-12">
              Finalizar Registro
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}