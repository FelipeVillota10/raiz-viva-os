/**
 * Selector de roles para registro
 * @celula - Celula1
 * Componente de presentación que utiliza useRoleSelector como ViewModel.
 *
 * Responsabilidades:
 *  - Renderizar la grilla de roles disponibles
 *  - Mostrar errores y estados de carga
 *  - Delegar toda la lógica de selección y navegación al hook
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/base/Button';
import { Card } from '@/components/ui/base/Card';
import { getRoleIcon } from '@/components/ui/base/Icons';
import { useRoleSelector } from '@/hooks/useRoleSelector';

export function RoleSelector() {
  const {
    actorRoles,
    turistaRole,
    selectedRoles,
    error,
    loading,
    hookError,
    isTuristaSelected,
    canContinue,
    handleRoleClick,
    handleContinue,
    roleNames,
  } = useRoleSelector();

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <p className="text-[#353535]">Cargando roles...</p>
        </div>
      </main>
    );
  }

  if (hookError) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <p className="text-[#E53935]">{hookError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-[#231F20] mb-2">Me identifico como?</h2>
        <p className="text-[#353535]">Selecciona tu rol en el ecosistema Raiz Viva</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {actorRoles.map((role) => {
          const isSelected = selectedRoles.includes(role.id);
          return (
            <Card
              key={role.id}
              onClick={() => handleRoleClick(role)}
              selected={isSelected}
              className="flex flex-col items-center text-center p-6"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isSelected ? 'bg-[#3E853F] text-white' : 'bg-[#EFF7EA] text-[#3E853F]'}`}>
                {getRoleIcon(role.nombre_tipo, '', 32)}
              </div>
              <h3 className="font-semibold text-[#231F20] mb-2">{roleNames[role.nombre_tipo] || role.nombre_tipo}</h3>
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

      {turistaRole && (
        <Card
          onClick={() => handleRoleClick(turistaRole)}
          selected={isTuristaSelected}
          className="flex flex-col items-center text-center p-6 mb-8 bg-[#E6D3A3]/30 border-[#8F9F81]"
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isTuristaSelected ? 'bg-[#3E853F] text-white' : 'bg-[#E6D3A3] text-[#3E853F]'}`}>
            {getRoleIcon(turistaRole.nombre_tipo, '', 32)}
          </div>
          <h3 className="font-semibold text-[#231F20] mb-2">Turista</h3>
          <p className="text-sm text-[#353535]">{turistaRole.descripcion}</p>
          {isTuristaSelected && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-[#3E853F] rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </Card>
      )}

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
