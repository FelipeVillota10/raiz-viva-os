'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MailIcon, LockIcon, ArrowLeftIcon } from '../components/ui/Icons';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        router.push('/');
      } else {
        setError('Credenciales inválidas. Verifique su correo y contraseña.');
      }
    } catch (err) {
      setError('Error de conexión. Asegúrate de que el backend esté corriendo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA]">
      <header className="flex items-center gap-4 px-6 py-4 bg-[#EFF7EA] border-b border-[#E6D3A3]">
        <button onClick={() => router.push('/')} className="p-2 rounded-lg hover:bg-[#E6D3A3] transition-colors">
          <ArrowLeftIcon className="text-[#231F20]" />
        </button>
        <h1 className="text-xl font-semibold text-[#231F20]">Iniciar Sesión</h1>
      </header>

      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#E6D3A3]">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-[#EFF7EA] rounded-full flex items-center justify-center">
              <Image src="/raiz_header.png" alt="Logo de Raiz Viva" width={60} height={60} className="object-contain" />
            </div>
            <h2 className="text-2xl font-semibold text-[#231F20]">Raíz Viva</h2>
            <p className="text-[#353535] mt-1">Conecta con la naturaleza</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input label="Correo Electrónico" name="email" type="email" value={formData.email} onChange={handleChange} icon={<MailIcon size={20} />} placeholder="correo@ejemplo.com" autoComplete="email" />
            <Input label="Contraseña" name="password" type="password" value={formData.password} onChange={handleChange} icon={<LockIcon size={20} />} placeholder="Tu contraseña" autoComplete="current-password" />

            {error && (
              <div className="p-3 bg-[#E53935]/10 border border-[#E53935] rounded-xl text-center">
                <p className="text-[#E53935] text-sm font-medium">{error}</p>
              </div>
            )}

            <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => router.push('/registro')} className="text-[#3E853F] hover:underline text-sm font-medium">
              ¿No tienes cuenta? Crea una
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}