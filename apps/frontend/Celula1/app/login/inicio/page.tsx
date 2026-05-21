'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { MailIcon, LockIcon } from '../../components/ui/Icons';
import { HeaderSecundario } from '../../components/HeaderSecundario';
import { Footer } from '../../components/Footer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginInicioPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validateField = (name: string, value: string): string | null => {
    const trimmedValue = value.trim();

    switch (name) {
      case 'email':
        if (!trimmedValue) return 'El correo electrónico es requerido.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedValue)) return 'Ingrese un correo electrónico válido.';
        return null;
      case 'password':
        if (!trimmedValue) return 'La contraseña es requerida.';
        if (trimmedValue.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
        return null;
      default:
        return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) newErrors[name as keyof FormErrors] = error;
      else delete newErrors[name as keyof FormErrors];
      return newErrors;
    });
    setGeneralError(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) newErrors[name as keyof FormErrors] = error;
      else delete newErrors[name as keyof FormErrors];
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const newErrors: FormErrors = {};
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        const payload = JSON.parse(atob(data.access.split('.')[1]));
        if (payload['es_lider']) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setGeneralError('Los líderes territoriales deben iniciar sesión desde el panel de líder.');
        } else if (payload['es_actor']) {
          router.push('/mi-perfil');
        } else {
          router.push('/');
        }
      } else {
        setGeneralError('Credenciales inválidas. Verifique su correo y contraseña.');
      }
    } catch {
      setGeneralError('Error de conexión. Asegúrate de que el backend esté corriendo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCrearCuenta = () => {
    router.push('/registro');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
      <HeaderSecundario backRoute="/" title="Iniciar Sesión" />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#E6D3A3] w-full max-w-md">
          <div className="flex justify-center mb-1">
            <Image
              src="/RaizLogoCirculo.png"
              alt="Logo de Raíz Viva"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>

          <p className="text-center text-[#353535] text-sm mb-8">
            Conectando comunidades rurales, productores y viajeros para un desarrollo sostenible
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              icon={<MailIcon size={20} />}
              placeholder="correo@ejemplo.com"
              autoComplete="email"
            />

            <Input
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              icon={<LockIcon size={20} />}
              placeholder="Mínimo 8 caracteres"
              autoComplete="current-password"
            />

            <div className="text-center">
              <button
                type="button"
                className="text-[#3E853F] text-sm hover:underline cursor-pointer"
                onClick={() => {
                }}
              >
                ¿Olvidaste la contraseña?
              </button>
            </div>

            {generalError && (
              <div className="p-3 bg-[#E53935]/10 border border-[#E53935] rounded-xl text-center">
                <p className="text-[#E53935] text-sm font-medium">{generalError}</p>
              </div>
            )}

            <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#353535] text-sm">
              <span className="font-bold">¿No tienes una cuenta?</span>{' '}
              <button
                type="button"
                onClick={handleCrearCuenta}
                className="text-[#3E853F] hover:underline font-medium cursor-pointer"
              >
                Crear cuenta
              </button>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}