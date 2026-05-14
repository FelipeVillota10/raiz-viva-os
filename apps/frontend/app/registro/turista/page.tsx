'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeaderSecundario } from '../../components/HeaderSecundario';
import { Footer } from '../../components/Footer';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { UserIcon, MailIcon, LockIcon, PhoneIcon } from '../../components/ui/Icons';
import { API_URL } from '../../lib/auth';

interface TipoActorApi {
  id: number;
  nombre_tipo: string;
}

interface MonedaApi {
  id: number;
  nombre: string;
  simbolo: string;
}

function labelTipoMoneda(m: MonedaApi): string {
  const s = (m.simbolo || '').trim();
  return s ? `${m.nombre} (${s})` : m.nombre;
}

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

interface FormData {
  nombre_completo: string;
  email: string;
  password: string;
  telefono: string;
  preferencias: string;
  id_tipo_moneda: string;
}

interface FormErrors {
  [key: string]: string;
}

const PREFERENCIA_OPTIONS = [
  { value: '', label: 'Seleccione sus actividades preferidas (opcional)' },
  { value: 'Naturaleza y senderismo', label: 'Naturaleza y senderismo' },
  { value: 'Gastronomía local', label: 'Gastronomía local' },
  { value: 'Cultura y patrimonio', label: 'Cultura y patrimonio' },
  { value: 'Bienestar y relajación', label: 'Bienestar y relajación' },
  { value: 'Experiencias comunitarias', label: 'Experiencias comunitarias' },
];

export default function RegistroTuristaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [turistaTipoId, setTuristaTipoId] = useState<number | null>(null);
  const [tiposError, setTiposError] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombre_completo: '',
    email: '',
    password: '',
    telefono: '',
    preferencias: '',
    id_tipo_moneda: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [monedaOptions, setMonedaOptions] = useState<{ value: string; label: string }[]>([
    { value: '', label: 'Cargando tipos de moneda…' },
  ]);
  const [monedasStatus, setMonedasStatus] = useState<'loading' | 'ok' | 'empty' | 'error'>('loading');

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [monedasRes, tiposRes] = await Promise.all([
          fetch(`${API_URL}/api/monedass/`),
          fetch(`${API_URL}/api/tipos-actores/`),
        ]);

        if (tiposRes.ok) {
          const tipos: unknown = await tiposRes.json();
          const arr = Array.isArray(tipos) ? (tipos as TipoActorApi[]) : [];
          const turista = arr.find((t) => t.nombre_tipo === 'turista');
          if (turista?.id != null) {
            setTuristaTipoId(turista.id);
          } else {
            setTiposError(true);
          }
        } else {
          setTiposError(true);
        }

        if (!monedasRes.ok) {
          setMonedasStatus('error');
          setMonedaOptions([{ value: '', label: 'No se pudieron cargar los tipos de moneda' }]);
          return;
        }
        const data: unknown = await monedasRes.json();
        const monedas = Array.isArray(data) ? (data as MonedaApi[]) : [];
        if (monedas.length === 0) {
          setMonedasStatus('empty');
          setMonedaOptions([
            { value: '', label: 'No hay tipos de moneda en la base de datos (ejecuta migraciones)' },
          ]);
          return;
        }
        setMonedasStatus('ok');
        setMonedaOptions([
          { value: '', label: 'Seleccione tipo de moneda' },
          ...monedas.map((m) => ({
            value: String(m.id),
            label: labelTipoMoneda(m),
          })),
        ]);
      } catch {
        setTiposError(true);
        setMonedasStatus('error');
        setMonedaOptions([{ value: '', label: 'No se pudieron cargar los tipos de moneda' }]);
      }
    };

    loadInitial();
  }, []);

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'nombre_completo':
        if (/\d/.test(value)) return 'El nombre no puede contener números.';
        if (value.trim().split(/\s+/).length < 2) return 'El nombre debe tener al menos 2 palabras.';
        if (value.length < 5) return 'El nombre debe tener al menos 5 caracteres.';
        return null;
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Ingrese un correo electrónico válido.';
        return null;
      }
      case 'password':
        if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
        if (!/[A-Z]/.test(value)) return 'La contraseña debe contener al menos una mayúscula.';
        if (!/\d/.test(value)) return 'La contraseña debe contener al menos un número.';
        return null;
      case 'telefono': {
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length < 7 || digitsOnly.length > 15) return 'El teléfono debe tener entre 7 y 15 dígitos.';
        if (!/^\d+$/.test(digitsOnly)) return 'El teléfono solo puede contener números.';
        return null;
      }
      default:
        return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'telefono') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    const raw = name === 'telefono' ? value.replace(/\D/g, '') : value;
    const error = validateField(name, raw);
    setErrors((prev) => {
      const next = { ...prev };
      if (error) next[name] = error;
      else delete next[name];
      return next;
    });
    setGeneralError(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const raw = name === 'telefono' ? value.replace(/\D/g, '') : value;
    const error = validateField(name, raw);
    setErrors((prev) => {
      const next = { ...prev };
      if (error) next[name] = error;
      else delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const keys: (keyof FormData)[] = [
      'nombre_completo',
      'email',
      'password',
      'telefono',
    ];
    const newErrors: FormErrors = {};
    keys.forEach((key) => {
      const v = formData[key];
      const err = validateField(key, key === 'telefono' ? v.replace(/\D/g, '') : v);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (turistaTipoId == null) {
      setGeneralError('No se pudo obtener el rol turista. Comprueba que el backend esté en marcha y recarga la página.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        nombre_completo: formData.nombre_completo,
        email: formData.email,
        password: formData.password,
        servicio: formData.preferencias,
        id_territorio: null,
        id_tipo_moneda: formData.id_tipo_moneda ? parseInt(formData.id_tipo_moneda, 10) : null,
        telefono: formData.telefono,
        tipos_actores: [turistaTipoId],
        es_actor: false,
        es_lider: false,
        es_turista: true,
      };

      const response = await fetch(`${API_URL}/api/registro/cliente/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        setGeneralError('El servidor no devolvió una respuesta válida.');
        return;
      }

      if (response.ok) {
        router.push('/');
        return;
      }

      const errObj = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
      const errores = errObj.errores;
      if (errores && typeof errores === 'object' && errores !== null) {
        const backendErrors: FormErrors = {};
        const e = errores as Record<string, unknown>;
        const nf = e.non_field_errors;
        if (Array.isArray(nf) && nf.length > 0) {
          setGeneralError(String(nf[0]));
        }
        Object.entries(e).forEach(([field, messages]) => {
          if (field === 'non_field_errors') return;
          if (Array.isArray(messages) && messages[0]) backendErrors[field] = String(messages[0]);
        });
        if (Object.keys(backendErrors).length > 0) setErrors(backendErrors);
      }
      if (typeof errObj.error === 'string') setGeneralError(errObj.error);
      if (typeof errObj.detail === 'string') setGeneralError(errObj.detail);
      if (Array.isArray(errObj.detail) && errObj.detail[0]) setGeneralError(String(errObj.detail[0]));
    } catch {
      setGeneralError('Error de conexión. Asegúrate de que el backend esté corriendo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
      <HeaderSecundario backRoute="/registro" title="Registro Turista" />

      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-10 lg:py-14">
        <div className="max-w-5xl mx-auto">
          <header className="text-center lg:text-left mb-8 lg:mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#231F20] tracking-tight">
              Registro del turista
            </h1>
            <p className="mt-2 text-lg text-[#353535] max-w-2xl mx-auto lg:mx-0">
              Completa el formulario para unirte a la red.
            </p>
          </header>

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
                  options={PREFERENCIA_OPTIONS}
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
