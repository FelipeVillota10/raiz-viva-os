'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { MailIcon, LockIcon } from '../../components/ui/Icons';
import { HeaderSecundario } from '../../components/HeaderSecundario';
import { Footer } from '../../components/Footer';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginInicioPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});

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
      else delete newErrors[name];
      return newErrors;
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) newErrors[name as keyof FormErrors] = error;
      else delete newErrors[name];
      return newErrors;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    router.push('/login');
  };

  const handleCrearCuenta = () => {
    router.push('/registro');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
      <HeaderSecundario backRoute="/" title="Iniciar Sesión" />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#E6D3A3] w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-1">
              <Image
                src="/RaizLogoCirculo.png"
                alt="Logo de Raíz Viva"
                width={400}
                height={400}
                className="object-contain"
              />
          </div>

          {/* Lema */}
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
                  // Funcionalidad futura - por ahora solo UI
                }}
              >
                ¿Olvidaste la contraseña?
              </button>
            </div>

            <Button type="submit" size="lg" className="w-full">
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