/**
 * ViewModel para registro de turista
 * @celula - Celula1
 * Maneja el estado, validación y envío del formulario de registro turista.
 *
 * Proporciona:
 *  - Estado del formulario (formData, errors, generalError)
 *  - Validación de campos
 *  - Handlers (handleChange, handleBlur, handleSubmit)
 *  - Datos de catálogos (monedas)
 *
 * Servicios utilizados: registroService
 *  - registroService.getMonedas()         -> GET /api/monedas/
 *  - registroService.getTiposActores()    -> GET /api/tipos-actores/
 *  - registroService.registrarCliente()   -> POST /api/registro/cliente/
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { registroService } from '@/services/registroService';
import { Moneda, TipoActor } from '@/models/types';

interface MonedaOption {
  value: string;
  label: string;
}

function labelTipoMoneda(m: Moneda): string {
  const raw = m as unknown as Record<string, unknown>;
  const nombre = m.nombre || String(raw['nombre_moneda'] || raw['nombre'] || '');
  const simbolo = (m.simbolo || String(raw['simbolo'] || '')).trim();
  return simbolo ? `${nombre} (${simbolo})` : nombre;
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

function validateField(name: string, value: string): string | null {
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
}

interface UseTuristaRegistroReturn {
  formData: FormData;
  errors: FormErrors;
  generalError: string | null;
  isLoading: boolean;
  monedaOptions: MonedaOption[];
  monedasStatus: 'loading' | 'ok' | 'empty' | 'error';
  turistaTipoId: number | null;
  tiposError: boolean;
  preferenciaOptions: typeof PREFERENCIA_OPTIONS;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

/**
 * Hook de registro de turista.
 *
 * Maneja todo el formulario: estado, validación, handlers y envío.
 * El componente (TuristaForm) solo renderiza y delega todo aquí.
 */
export function useTuristaRegistro(): UseTuristaRegistroReturn {
  const router = useRouter();
  const [monedaOptions, setMonedaOptions] = useState<MonedaOption[]>([
    { value: '', label: 'Cargando tipos de moneda...' },
  ]);
  const [monedasStatus, setMonedasStatus] = useState<'loading' | 'ok' | 'empty' | 'error'>('loading');
  const [turistaTipoId, setTuristaTipoId] = useState<number | null>(null);
  const [tiposError, setTiposError] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [monedas, tipos] = await Promise.all([
          registroService.getMonedas(),
          registroService.getTiposActores(),
        ]);

        const turista = tipos.find((t: TipoActor) => t.nombre_tipo === 'turista');
        if (turista?.id != null) {
          setTuristaTipoId(turista.id);
        } else {
          setTiposError(true);
        }

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
          ...monedas.map((m) => {
            const raw = m as unknown as Record<string, unknown>;
            return {
              value: String(m.id ?? raw['id_moneda'] ?? raw['id_tipo_moneda'] ?? 0),
              label: labelTipoMoneda(m),
            };
          }),
        ]);
      } catch {
        setTiposError(true);
        setMonedasStatus('error');
        setMonedaOptions([{ value: '', label: 'No se pudieron cargar los tipos de moneda' }]);
      }
    };

    loadInitial();
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const raw = name === 'telefono' ? value.replace(/\D/g, '') : value;
    const error = validateField(name, raw);
    setErrors((prev) => {
      const next = { ...prev };
      if (error) next[name] = error;
      else delete next[name];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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

      await registroService.registrarCliente(payload);
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error de conexión. Asegúrate de que el backend esté corriendo.';
      setGeneralError(message);
    } finally {
      setIsLoading(false);
    }
  }, [formData, turistaTipoId, router]);

  return {
    formData,
    errors,
    generalError,
    isLoading,
    monedaOptions,
    monedasStatus,
    turistaTipoId,
    tiposError,
    preferenciaOptions: PREFERENCIA_OPTIONS,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
