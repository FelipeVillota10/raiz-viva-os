'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LockIcon, MailIcon } from '../../components/ui/Icons';
import { Footer } from '../../components/Footer';
import { setTokens, clearAuth } from '../../services/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
        setTokens(data.access, data.refresh);

        const payload = JSON.parse(atob(data.access.split('.')[1]));
        if (!payload['es_lider']) {
          clearAuth();
          setError('No tienes acceso al panel de líder territorial.');
          setIsLoading(false);
          return;
        }

        window.location.href = '/lider/aprobaciones';
      } else {
        const mensaje = Array.isArray(data.detail) ? data.detail[0] : (data.detail || data.error || 'Credenciales inválidas.');
        setError(mensaje);
      }
    } catch {
      setError('Error de conexión. Asegúrate de que el backend esté corriendo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
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
            Conectando comunidades rurales, productores y viajeros para un desarrollo territorial sostenible
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
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
              <div className="p-3 bg-[#E53935]/10 border border-[#E53935] rounded-xl text-center">
                <p className="text-[#E53935] text-sm font-medium">{error}</p>
              </div>
            )}

            <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
              Iniciar Sesión
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}