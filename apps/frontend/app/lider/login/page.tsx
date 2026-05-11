'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LockIcon, MailIcon } from '../../components/ui/Icons';
import Image from 'next/image';
import { Footer } from '../../components/Footer';
import { API_URL } from '../../lib/auth';

export default function LiderLoginPage() {
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
        if (!payload['es_lider']) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setError('No tienes acceso al panel de líder territorial.');
          setIsLoading(false);
          return;
        }

        document.cookie = `access_token=${data.access}; path=/; max-age=${60 * 60}`;
        document.cookie = `refresh_token=${data.refresh}; path=/; max-age=${60 * 60 * 24 * 7}`;
        router.push('/lider/aprobaciones');
      } else {
        setError(data.detail || 'Credenciales inválidas.');
      }
    } catch {
      setError('Error de conexión. Asegúrate de que el backend esté corriendo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f3e7]">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-md p-8 border border-[#E6D3A3] w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-[#EFF7EA] rounded-full flex items-center justify-center">
              <Image src="/raiz_header.png" alt="Logo de Raiz Viva" width={60} height={60} className="object-contain" />
            </div>
            <h2 className="text-2xl font-semibold text-[#557149]">Panel del Líder Territorial</h2>
            <p className="text-[#353535] mt-1">Ingresa tus credenciales para acceder</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
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
              icon={<LockIcon size={20} />}
              placeholder="Tu contraseña"
              autoComplete="current-password"
            />

            {error && (
              <div className="p-3 bg-red-50 border border-[#ef4444] rounded-xl text-center">
                <p className="text-[#ef4444] text-sm font-medium">{error}</p>
              </div>
            )}

            <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
              Iniciar Sesión
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}