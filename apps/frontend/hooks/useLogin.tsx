/**
 * ViewModel para login
 * @celula - Celula1
 * Maneja el estado y lógica de negocio para los formularios de login.
 *
 * Proporciona:
 *  - Estado del formulario (email, password)
 *  - Validación de campos
 *  - Login con verificación de rol
 *  - Estados de carga y error
 *
 * Servicios utilizados: authService
 *  - authService.login(credentials) -> POST /api/token/
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export type LoginRole = 'general' | 'admin' | 'lider';

interface FormErrors {
  email?: string;
  password?: string;
}

interface UseLoginReturn {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  errors: FormErrors;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

function validateField(name: string, value: string): string | null {
  const trimmedValue = value.trim();

  switch (name) {
    case 'email':
      if (!trimmedValue) return 'El correo electrónico es requerido.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) return 'Ingrese un correo electrónico válido.';
      return null;
    case 'password':
      if (!trimmedValue) return 'La contraseña es requerida.';
      if (trimmedValue.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
      return null;
    default:
      return null;
  }
}

/**
 * Hook de login con validación y verificación de rol.
 *
 * @param role - Determina la lógica de redirección post-login:
 *   - 'general': actores van a /mi-perfil, turistas a /, líderes rechazados
 *   - 'admin': solo admins, redirige a /admin/territorios
 *   - 'lider': solo líderes, redirige a /lider/aprobaciones
 */
export function useLogin(role: LoginRole = 'general'): UseLoginReturn {
  const router = useRouter();
  const { login: authLogin, error: authError, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const error = authError ?? localError;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);

    const fieldError = validateField(name, value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (fieldError) newErrors[name as keyof FormErrors] = fieldError;
      else delete newErrors[name as keyof FormErrors];
      return newErrors;
    });
    setLocalError(null);
    clearError();
  }, [clearError]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (fieldError) newErrors[name as keyof FormErrors] = fieldError;
      else delete newErrors[name as keyof FormErrors];
      return newErrors;
    });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);

    if (emailError || passwordError) {
      setErrors({
        ...(emailError && { email: emailError }),
        ...(passwordError && { password: passwordError }),
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = await authLogin(email.trim(), password);

      // Verificar que el rol del usuario coincida con el formulario de login
      if (role === 'admin') {
        if (!user?.es_admin) {
          setLocalError('No tienes permisos de administrador.');
          return;
        }
        router.push('/admin/dashboard');
      } else if (role === 'lider') {
        if (!user?.es_lider) {
          setLocalError('No tienes acceso al panel de líder territorial.');
          return;
        }
        router.push('/lider/aprobaciones');
      } else {
        // Login general: líderes deben usar su propio formulario
        if (user?.es_lider) {
          setLocalError('Los líderes territoriales deben iniciar sesión desde el panel de líder.');
        } else if (user?.es_actor) {
          router.push('/actor/perfil');
        } else {
          router.push('/');
        }
      }
    } catch {
      // authError ya se seteo en el contexto useAuth
    } finally {
      setIsLoading(false);
    }
  }, [email, password, role, router, authLogin, clearError]);

  return {
    email,
    password,
    isLoading,
    error,
    errors,
    setEmail,
    setPassword,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
