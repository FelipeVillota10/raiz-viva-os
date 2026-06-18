/**
 * ViewModel para selector de roles en registro
 * @celula - Celula1
 * Maneja la selección de roles, reglas de negocio (turista no se mezcla con actor),
 * persistencia en localStorage y navegación al formulario correspondiente.
 *
 * Servicios utilizados: registroService (vía useRegistro)
 *  - registroService.getTiposActores() -> GET /api/tipos-actores/
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useRegistro } from '@/hooks/useRegistro';
import { TipoActor } from '@/models/types';

interface UseRoleSelectorReturn {
  actorRoles: TipoActor[];
  turistaRole: TipoActor | undefined;
  selectedRoles: number[];
  error: string | null;
  loading: boolean;
  hookError: string | null;
  isTuristaSelected: boolean;
  canContinue: boolean;
  handleRoleClick: (role: TipoActor) => void;
  handleContinue: () => void;
  roleNames: Record<string, string>;
}

const ROLE_NAMES: Record<string, string> = {
  productor: 'Productor',
  caminante: 'Caminante',
  custodio: 'Custodio',
  facilitador: 'Facilitador',
  anfitrion: 'Anfitrion',
  turista: 'Turista',
};

/**
 * Hook selector de roles para el flujo de registro.
 *
 * Regla de negocio: turista NO se mezcla con roles de actor.
 * Si se selecciona turista, se deseleccionan todos los actores y viceversa.
 *
 * Al hacer "Continue", los roles seleccionados se guardan en localStorage
 * y el usuario es redirigido al formulario correspondiente.
 */
export function useRoleSelector(): UseRoleSelectorReturn {
  const router = useRouter();
  const { tiposActores: roles, loading, error: hookError, fetchTiposActores } = useRegistro();
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTiposActores();
  }, [fetchTiposActores]);

  const turistaRole = useMemo(() => roles.find(r => r.nombre_tipo === 'turista'), [roles]);
  const actorRoles = useMemo(() => roles.filter(r => r.nombre_tipo !== 'turista'), [roles]);

  const isTuristaSelected = turistaRole ? selectedRoles.includes(turistaRole.id) : false;
  const otherRolesSelected = actorRoles.some(r => selectedRoles.includes(r.id));
  const canContinue = selectedRoles.length > 0 && !(isTuristaSelected && otherRolesSelected);

  const handleRoleClick = useCallback((role: TipoActor) => {
    const isTurista = role.nombre_tipo === 'turista';

    if (isTurista) {
      // Turista: selección exclusiva (si ya estaba seleccionado, lo quita)
      setSelectedRoles(prev => prev.includes(role.id) ? prev.filter(id => id !== role.id) : [role.id]);
    } else {
      // Actor: no permitir si turista está seleccionado (regla de negocio)
      if (selectedRoles.includes(turistaRole?.id || 0)) {
        return;
      }
      // Toggle: agregar o quitar el rol de actor
      setSelectedRoles(prev => prev.includes(role.id) ? prev.filter(id => id !== role.id) : [...prev, role.id]);
    }

    setError(null);
  }, [selectedRoles, turistaRole]);

  const handleContinue = useCallback(() => {
    // Validar regla de negocio: turista no se mezcla con actor
    if (isTuristaSelected && otherRolesSelected) {
      setError('El turista solo puede seleccionar el rol de turista');
      return;
    }

    if (selectedRoles.length === 0) {
      setError('Seleccione uno o mas roles para continuar');
      return;
    }

    // Persistir selección para que el formulario de registro la lea
    localStorage.setItem('selected_roles', JSON.stringify(selectedRoles));

    // Redirigir según el tipo de registro
    if (isTuristaSelected) {
      router.push('/registro/turista');
    } else {
      router.push('/registro/actor-territorial');
    }
  }, [selectedRoles, isTuristaSelected, otherRolesSelected, router]);

  return {
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
    roleNames: ROLE_NAMES,
  };
}
