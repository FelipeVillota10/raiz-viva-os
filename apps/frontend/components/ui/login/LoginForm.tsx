/**
 * Formulario de login unificado
 * @celula - Celula1
 *
 * Componente de presentación que utiliza useLogin como ViewModel.
 * Acepta props para personalizar el comportamiento según el rol:
 *  - role: determina qué useLogin('general' | 'admin' | 'lider') se usa
 *  - subtitle: texto descriptivo debajo del logo
 *  - showForgotPassword: muestra el link "¿Olvidaste la contraseña?"
 *  - showCreateAccount: muestra el link "Crear cuenta"
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/base/Button';
import { Input } from '@/components/ui/base/Input';
import { MailIcon, LockIcon } from '@/components/ui/base/Icons';
import { useLogin, LoginRole } from '@/hooks/useLogin';

interface LoginFormProps {
  /** Rol que determina la lógica de autenticación y redirección */
  role?: LoginRole;
  /** Texto descriptivo debajo del logo */
  subtitle?: string;
  /** Muestra el link "¿Olvidaste la contraseña?" */
  showForgotPassword?: boolean;
  /** Muestra el link "Crear cuenta" */
  showCreateAccount?: boolean;
}

export function LoginForm({
  role = 'general',
  subtitle = 'Conectando comunidades rurales, productores y viajeros para un desarrollo sostenible',
  showForgotPassword = false,
  showCreateAccount = false,
}: LoginFormProps) {
  const router = useRouter();
  const {
    isLoading,
    error,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useLogin(role);

  return (
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
        {subtitle}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Correo Electrónico"
          name="email"
          type="email"
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
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          icon={<LockIcon size={20} />}
          placeholder="Mínimo 8 caracteres"
          autoComplete="current-password"
        />

        {showForgotPassword && (
          <div className="text-center">
            <button
              type="button"
              className="text-[#3E853F] text-sm hover:underline cursor-pointer"
              onClick={() => {}}
            >
              ¿Olvidaste la contraseña?
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-[#E53935]/10 border border-[#E53935] rounded-xl text-center">
            <p className="text-[#E53935] text-sm font-medium">{error}</p>
          </div>
        )}

        <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
          Iniciar Sesión
        </Button>
      </form>

      {showCreateAccount && (
        <div className="mt-6 text-center">
          <p className="text-[#353535] text-sm">
            <span className="font-bold">¿No tienes una cuenta?</span>{' '}
            <button
              type="button"
              onClick={() => router.push('/registro')}
              className="text-[#3E853F] hover:underline font-medium cursor-pointer"
            >
              Crear cuenta
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
