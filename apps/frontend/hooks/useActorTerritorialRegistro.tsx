/**
 * ViewModel para registro de actor territorial
 * @celula - Celula1
 * Maneja el estado, validación y envío del formulario de registro de actor territorial.
 *
 * Proporciona:
 *  - Estado del formulario (formData, errors, generalError)
 *  - Validación de campos
 *  - Handlers (handleChange, handleBlur, handleSubmit)
 *  - Datos de catálogos (territorios, monedas, servicios)
 *  - Selección de roles y servicios
 *
 * Servicios utilizados: registroService (vía useRegistro)
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRegistro } from '@/hooks/useRegistro';

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

interface UseActorTerritorialRegistroReturn {
  formData: FormData;
  errors: FormErrors;
  generalError: string | null;
  isLoading: boolean;
  selectedRoles: number[];
  selectedServicios: number[];
  territorioOptions: { value: string; label: string }[];
  monedaOptions: { value: string; label: string }[];
  serviciosOptions: { id: number; nombre: string }[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  toggleServicio: (id: number) => void;
}

function validateField(name: string, value: string): string | null {
  switch (name) {
    case 'nombre_completo':
      if (value.length < 3) return 'El nombre del negocio debe tener al menos 3 caracteres.';
      return null;
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Ingrese un correo electrónico válido.';
      return null;
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
    case 'id_territorio':
      if (!value) return 'Seleccione un territorio.';
      return null;
    case 'id_tipo_moneda':
      if (!value) return 'Seleccione una moneda.';
      return null;
    default:
      return null;
  }
}

/**
 * Hook de registro de actor territorial.
 *
 * Maneja todo el formulario: estado, validación, handlers, selección de servicios y envío.
 * Los roles seleccionados se leen de localStorage (persistidos por useRoleSelector).
 * El componente (ActorTerritorialForm) solo renderiza y delega todo aquí.
 */
export function useActorTerritorialRegistro(): UseActorTerritorialRegistroReturn {
  const router = useRouter();
  const {
    territorios,
    monedas,
    servicios,
    fetchTerritorios,
    fetchMonedas,
    fetchServicios,
    registrarActorTerritorial,
  } = useRegistro();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoles] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selected_roles');
      if (stored) {
        try {
          const roles = JSON.parse(stored);
          if (Array.isArray(roles)) return roles;
        } catch {}
      }
    }
    return [];
  });
  const [selectedServicios, setSelectedServicios] = useState<number[]>([]);
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

  const catalogosLoaded = useRef(false);
  useEffect(() => {
    if (!catalogosLoaded.current) {
      catalogosLoaded.current = true;
      fetchTerritorios();
      fetchMonedas();
      fetchServicios();
    }
  }, [fetchTerritorios, fetchMonedas, fetchServicios]);

  const territorioOptions = [
    { value: '', label: 'Seleccione un territorio' },
    ...territorios.map((t) => ({
      value: String(t.id_territorio),
      label: t.nombre_territorio || t.nombre_estado,
    })),
  ];

  const monedaOptions = [
    { value: '', label: 'Seleccione una moneda' },
    ...monedas.map((m) => {
      const raw = m as unknown as Record<string, unknown>;
      return {
        value: String(m.id ?? raw['id_moneda'] ?? raw['id_tipo_moneda'] ?? 0),
        label: m.nombre_moneda || String(raw['nombre_moneda'] || raw['nombre'] || ''),
      };
    }),
  ];

  const toggleServicio = useCallback((id: number) => {
    setSelectedServicios(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, name === 'telefono' ? value.replace(/\D/g, '') : value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) newErrors[name] = error;
      else delete newErrors[name];
      return newErrors;
    });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
      await registrarActorTerritorial({
        nombre_completo: formData.nombre_completo,
        email: formData.email,
        password: formData.password,
        id_territorio: formData.id_territorio ? parseInt(formData.id_territorio) : undefined,
        id_tipo_moneda: formData.id_tipo_moneda ? parseInt(formData.id_tipo_moneda) : undefined,
        telefono: formData.telefono,
        tipos_actores: selectedRoles,
        servicios: selectedServicios,
        es_actor: true,
        es_lider: false,
        es_turista: false,
      });

      router.push('/registro/confirmacion');
    } catch (error) {
      if (error instanceof Error) {
        setGeneralError(error.message);
      } else {
        setGeneralError('Error de conexión. Asegúrate de que el backend esté corriendo.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, selectedRoles, selectedServicios, registrarActorTerritorial, router]);

  return {
    formData,
    errors,
    generalError,
    isLoading,
    selectedRoles,
    selectedServicios,
    territorioOptions,
    monedaOptions,
    serviciosOptions: servicios,
    handleChange,
    handleBlur,
    handleSubmit,
    toggleServicio,
  };
}
