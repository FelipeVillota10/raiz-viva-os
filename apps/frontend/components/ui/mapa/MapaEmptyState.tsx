/**
 * Estado vacío del mapa
 * @celula - Celula1
 * Muestra un mensaje cuando no hay actores con dirección geocodificada.
 */

'use client';

import React from 'react';

export function MapaEmptyState() {
  return (
    <p style={{ padding: '1rem' }}>
      No hay actores territoriales con dirección para mostrar.
    </p>
  );
}
