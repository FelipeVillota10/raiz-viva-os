/**
 * Contenido del InfoWindow del mapa
 * @celula - Celula1
 * Muestra los datos del actor territorial seleccionado en el mapa.
 */

'use client';

import React from 'react';
import { ClienteMapa } from '@/services/mapaService';

interface ActorInfoWindowProps {
  actor: ClienteMapa;
}

export function ActorInfoWindow({ actor }: ActorInfoWindowProps) {
  return (
    <div style={{ maxWidth: '220px' }}>
      <h3>{actor.nombre}</h3>
      <p><b>Email:</b> {actor.usuario_nombre}</p>
      <p><b>Dirección:</b> {actor.direccion}</p>
      <p>
        <b>Roles:</b>{' '}
        {actor.tipos_actores.map((t) => t.nombre_tipo).join(', ') || 'Sin rol'}
      </p>
      {actor.foto_perfil_url && (
        <img src={actor.foto_perfil_url} alt="Perfil" width="80" />
      )}
    </div>
  );
}
