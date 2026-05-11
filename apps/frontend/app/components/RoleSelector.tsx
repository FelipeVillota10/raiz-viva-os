'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { getRoleIcon } from './ui/Icons';

interface Role {
  id: number;
  nombre: string;
  icono: string;
  descripcion: string;
  es_turista: boolean;
}

interface RoleSelectorProps {
  selectedRoles: number[];
  onRoleToggle: (roleId: number) => void;
}

export function RoleSelector({ selectedRoles, onRoleToggle }: RoleSelectorProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [roles] = useState<Role[]>([
    { id: 1, nombre: 'productor', icono: 'seed', descripcion: 'Suministro de productos locales y artesanales', es_turista: false },
    { id: 2, nombre: 'caminante', icono: 'hiking', descripcion: 'Guía de rutas e intérprete de saberes', es_turista: false },
    { id: 3, nombre: 'custodio', icono: 'shield', descripcion: 'Protección de biodiversidad y patrimonio', es_turista: false },
    { id: 4, nombre: 'facilitador', icono: 'users', descripcion: 'Tallerista y gestor de experiencias', es_turista: false },
    { id: 5, nombre: 'anfitrion', icono: 'home', descripcion: 'Gestor de alojamiento, gastronomía y transporte', es_turista: false },
  ]);

  const turistaRole = { id: 6, nombre: 'turista', icono: 'compass', descripcion: 'Visitante de experiencias', es_turista: true };

  const handleRoleClick = (role: Role) => {
    const isTurista = role.nombre === 'turista';

    if (isTurista) {
      if (selectedRoles.includes(6)) {
        onRoleToggle(6);
      } else {
        onRoleToggle(6);
      }
    } else {
      if (selectedRoles.includes(6)) {
        return;
      }
      onRoleToggle(role.id);
    }

    setError(null);
  };

  const isTuristaSelected = selectedRoles.includes(6);
  const otherRolesSelected = roles.some(r => selectedRoles.includes(r.id));
  const canContinue = selectedRoles.length > 0 && !(isTuristaSelected && otherRolesSelected);

  const handleContinue = () => {
    if (isTuristaSelected && otherRolesSelected) {
      setError('El turista solo puede seleccionar el rol de turista');
      return;
    }

    if (selectedRoles.length === 0) {
      setError('Seleccione uno o más roles para continuar');
      return;
    }

    localStorage.setItem('selected_roles', JSON.stringify(selectedRoles));

    if (isTuristaSelected) {
      router.push('/registro/turista');
    } else {
      router.push('/registro/actor-territorial');
    }
  };

  const roleNames: Record<string, string> = {
    productor: 'Productor',
    caminante: 'Caminante',
    custodio: 'Custodio',
    facilitador: 'Facilitador',
    anfitrion: 'Anfitrión',
    turista: 'Turista',
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-[#231F20] mb-2">¿Me identifico como?</h2>
        <p className="text-[#353535]">Selecciona tu rol en el ecosistema Raíz Viva</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {roles.map((role) => {
          const isSelected = selectedRoles.includes(role.id);
          return (
            <Card
              key={role.id}
              onClick={() => handleRoleClick(role)}
              selected={isSelected}
              className="flex flex-col items-center text-center p-6"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isSelected ? 'bg-[#3E853F] text-white' : 'bg-[#EFF7EA] text-[#3E853F]'}`}>
                {getRoleIcon(role.nombre, '', 32)}
              </div>
              <h3 className="font-semibold text-[#231F20] mb-2">{roleNames[role.nombre]}</h3>
              <p className="text-sm text-[#353535]">{role.descripcion}</p>
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-[#3E853F] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card
        onClick={() => handleRoleClick(turistaRole)}
        selected={isTuristaSelected}
        className="flex flex-col items-center text-center p-6 mb-8 bg-[#E6D3A3]/30 border-[#8F9F81]"
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isTuristaSelected ? 'bg-[#3E853F] text-white' : 'bg-[#E6D3A3] text-[#3E853F]'}`}>
          {getRoleIcon('turista', '', 32)}
        </div>
        <h3 className="font-semibold text-[#231F20] mb-2">Turista</h3>
        <p className="text-sm text-[#353535]">Visitante de experiencias</p>
      </Card>

      {error && (
        <div className="mb-6 p-4 bg-[#E53935]/10 border border-[#E53935] rounded-xl text-center">
          <p className="text-[#E53935] font-medium">{error}</p>
        </div>
      )}

      <div className="flex justify-center">
        <Button onClick={handleContinue} disabled={!canContinue} size="lg" className="px-12">
          Continuar
        </Button>
      </div>
    </main>
  );
}

export function useRoleSelector() {
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  const toggleRole = (roleId: number) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      }
      return [...prev, roleId];
    });
  };

  return { selectedRoles, toggleRole };
}