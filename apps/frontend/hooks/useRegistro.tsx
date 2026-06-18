/**
 * Hook para el flujo de registro.
 *
 * Proporciona:
 *  - Catálogos (territorios, monedas, tipos de actor, servicios)
 *  - Funciones de registro para turista y actor territorial
 *
 * Los catálogos se cargan de forma independiente (cada fetch maneja su propio error).
 * Los errores de catálogo se loggean a console pero no se exponen al usuario,
 * ya que son datos de apoyo que deberían estar disponibles.
 *
 * Servicios utilizados: registroService
 *  - registroService.getTerritorios()     -> GET /api/territorios/
 *  - registroService.getMonedas()         -> GET /api/monedas/
 *  - registroService.getTiposActores()    -> GET /api/tipos-actores/
 *  - registroService.getServicios()       -> GET /api/servicios/
 *  - registroService.registrarCliente()   -> POST /api/registro/cliente/
 */

'use client';

import { useState, useCallback } from 'react';
import { registroService } from '@/services/registroService';
import { RegistroData, Territorio, Moneda, TipoActor, Servicio } from '@/models/types';

interface UseRegistroReturn {
  territorios: Territorio[];
  monedas: Moneda[];
  tiposActores: TipoActor[];
  servicios: Servicio[];
  loading: boolean;
  error: string | null;
  success: boolean;
  mensaje: string;
  fetchTerritorios: () => Promise<void>;
  fetchMonedas: () => Promise<void>;
  fetchTiposActores: () => Promise<void>;
  fetchServicios: () => Promise<void>;
  registrarTurista: (data: Omit<RegistroData, 'tipos_actores' | 'es_actor' | 'es_lider' | 'es_turista' | 'id_territorio' | 'id_tipo_moneda'> & { tipoActorId: number }) => Promise<void>;
  registrarActorTerritorial: (data: RegistroData) => Promise<void>;
  reset: () => void;
}

export function useRegistro(): UseRegistroReturn {
  const [territorios, setTerritorios] = useState<Territorio[]>([]);
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [tiposActores, setTiposActores] = useState<TipoActor[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const fetchTerritorios = useCallback(async () => {
    try {
      const data = await registroService.getTerritorios();
      setTerritorios(data);
    } catch (err) {
      console.error('Error fetching territorios:', err);
    }
  }, []);

  const fetchMonedas = useCallback(async () => {
    try {
      const data = await registroService.getMonedas();
      setMonedas(data);
    } catch (err) {
      console.error('Error fetching monedas:', err);
    }
  }, []);

  const fetchTiposActores = useCallback(async () => {
    try {
      const data = await registroService.getTiposActores();
      setTiposActores(data);
    } catch (err) {
      console.error('Error fetching tipos actores:', err);
    }
  }, []);

  const fetchServicios = useCallback(async () => {
    try {
      const data = await registroService.getServicios();
      setServicios(data);
    } catch (err) {
      console.error('Error fetching servicios:', err);
    }
  }, []);

  const registrarTurista = useCallback(async (data: Omit<RegistroData, 'tipos_actores' | 'es_actor' | 'es_lider' | 'es_turista' | 'id_territorio' | 'id_tipo_moneda'> & { tipoActorId: number }) => {
    try {
      setLoading(true);
      setError(null);
      const payload: RegistroData = {
        nombre_completo: data.nombre_completo,
        email: data.email,
        password: data.password,
        telefono: data.telefono,
        tipos_actores: [data.tipoActorId],
        es_actor: false,
        es_lider: false,
        es_turista: true,
      };
      const result = await registroService.registrarCliente(payload);
      setSuccess(true);
      setMensaje(result.mensaje);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrar';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registrarActorTerritorial = useCallback(async (data: RegistroData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await registroService.registrarCliente(data);
      setSuccess(true);
      setMensaje(result.mensaje);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrar';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setMensaje('');
  }, []);

  return {
    territorios,
    monedas,
    tiposActores,
    servicios,
    loading,
    error,
    success,
    mensaje,
    fetchTerritorios,
    fetchMonedas,
    fetchTiposActores,
    fetchServicios,
    registrarTurista,
    registrarActorTerritorial,
    reset,
  };
}
