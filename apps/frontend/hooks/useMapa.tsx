/**
 * ViewModel para el mapa económico
 * @celula - Celula1
 * Maneja el estado y la lógica de negocio para la vista del mapa.
 *
 * Proporciona:
 *  - Lista de clientes geolocalizados
 *  - Cliente seleccionado
 *  - Estados de carga
 *
 * Servicios utilizados: mapaService
 *  - mapaService.getClientes()         -> GET /api/clientes/
 *  - mapaService.getCoordinates(addr)  -> Google Geocoding API
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { mapaService, ClienteMapa } from '@/services/mapaService';

interface UseMapaReturn {
  clientes: ClienteMapa[];
  selected: ClienteMapa | null;
  loading: boolean;
  setSelected: (cliente: ClienteMapa | null) => void;
}

/**
 * Hook del mapa económico.
 *
 * Pipeline de carga:
 *  1. Obtiene todos los clientes del backend.
 *  2. Filtra solo actores con dirección física.
 *  3. Geocodifica las direcciones en paralelo vía Google Geocoding API.
 *  4. Filtra solo los clientes que obtuvieron coordenadas válidas.
 *
 * Nota: clientes sin geocoding (dirección inválida o API key faltante) se excluyen.
 */
export function useMapa(): UseMapaReturn {
  const [clientes, setClientes] = useState<ClienteMapa[]>([]);
  const [selected, setSelected] = useState<ClienteMapa | null>(null);
  const [loading, setLoading] = useState(true);

  const loadClientes = useCallback(async () => {
    try {
      // 1. Obtener todos los clientes
      const data = await mapaService.getClientes();

      // 2. Filtrar solo actores con dirección física (necesaria para geocoding)
      const actores = data.filter(
        (c) => c.es_actor && c.direccion && c.direccion.trim().length > 0
      );

      // 3. Geocodificar direcciones en paralelo (tolerante a fallos individuales)
      const results = await Promise.allSettled(
        actores.map(async (c) => {
          const coords = await mapaService.getCoordinates(c.direccion!);
          return coords ? { ...c, lat: coords.lat, lng: coords.lng } : c;
        })
      );

      // 4. Filtrar solo los que obtuvieron coordenadas válidas
      const geocoded = results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => (r as PromiseFulfilledResult<ClienteMapa>).value);

      setClientes(geocoded);
    } catch (err) {
      console.error('Error cargando clientes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  return {
    clientes,
    selected,
    loading,
    setSelected,
  };
}
