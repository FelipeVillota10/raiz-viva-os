/**
 * Tarjeta de perfil del actor territorial
 * @celula - Celula1
 * Muestra la información completa del perfil con portada, foto, nombre, territorio,
 * reputación, estado y descripción. Soporta modo edición.
 */

'use client';

import React from 'react';
import { Textarea } from '@/components/ui/base/Input';
import { PerfilActor } from '@/models/types';

interface PerfilCardProps {
  perfil: PerfilActor;
  isEditing: boolean;
  editNombre: string;
  editDescripcion: string;
  previewPerfil: string | null;
  previewPortada: string | null;
  perfilInputRef: React.RefObject<HTMLInputElement | null>;
  portadaInputRef: React.RefObject<HTMLInputElement | null>;
  setEditNombre: (v: string) => void;
  setEditDescripcion: (v: string) => void;
  handlePerfilFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePortadaFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  normalizeImageUrl: (url: string | null | undefined) => string | null;
}

export function PerfilCard({
  perfil,
  isEditing,
  editNombre,
  editDescripcion,
  previewPerfil,
  previewPortada,
  perfilInputRef,
  portadaInputRef,
  setEditNombre,
  setEditDescripcion,
  handlePerfilFile,
  handlePortadaFile,
  normalizeImageUrl,
}: PerfilCardProps) {
  const fotoPerfilSrc = previewPerfil || normalizeImageUrl(perfil.foto_perfil_url) || normalizeImageUrl(perfil.foto_perfil) || '/RaizLogoCirculo.png';
  const fotoPortadaSrc = previewPortada || normalizeImageUrl(perfil.foto_portada_url) || normalizeImageUrl(perfil.foto_portada);

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-[#E6D3A3] overflow-hidden">
      {/* Foto Portada */}
      <div
        className={`relative w-full h-40 sm:h-56 ${isEditing ? 'cursor-pointer' : ''}`}
        onClick={() => isEditing && portadaInputRef.current?.click()}
      >
        {fotoPortadaSrc ? (
          <img src={fotoPortadaSrc} alt="Portada" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#3b5630] to-[#557149] flex items-center justify-center">
            {isEditing && (
              <span className="text-white/70 text-sm">+ Añadir foto de portada</span>
            )}
          </div>
        )}
        <input
          ref={portadaInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePortadaFile}
        />
      </div>

      {/* Info Principal */}
      <div className="px-6 pb-6">
        {/* Foto Perfil (sobrepuesta a la portada) */}
        <div className="-mt-12 relative z-10 flex justify-center sm:justify-start">
          <div
            className={`w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-md ${isEditing ? 'cursor-pointer' : ''}`}
            onClick={() => isEditing && perfilInputRef.current?.click()}
          >
            <img src={fotoPerfilSrc} alt="Perfil" className="w-full h-full object-cover" />
            <input
              ref={perfilInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePerfilFile}
            />
          </div>
        </div>

        {/* Nombre + Territorio */}
        <div className="mt-3 text-center sm:text-left">
          {isEditing ? (
            <input
              type="text"
              value={editNombre}
              onChange={(e) => setEditNombre(e.target.value)}
              className="text-xl font-bold text-[#231F20] bg-[#F4F1EA] border border-[#E6D3A3] rounded-lg px-3 py-1 w-full"
            />
          ) : (
            <h2 className="text-xl font-bold text-[#231F20]">{perfil.nombre}</h2>
          )}
          <p className="text-sm text-[#353535] mt-0.5">
            {perfil.territorio_nombre || 'Sin territorio'}
            {perfil.tipos_actores.length > 0 && (
              <span className="ml-2 text-[#3b5630] font-medium capitalize">
                · {perfil.tipos_actores.map(t => t.nombre_tipo).join(', ')}
              </span>
            )}
          </p>
        </div>

        {/* Reputación */}
        <div className="flex items-center justify-center sm:justify-start gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const reputacion = perfil.reputacion || 0;
            const filled = star <= Math.round(reputacion);
            return (
              <svg
                key={star}
                className={`w-4 h-4 ${filled ? 'text-yellow-500' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            );
          })}
          <span className="text-xs text-[#353535] ml-1">
          ({perfil.reputacion ? Number(perfil.reputacion).toFixed(1) : '0.0'})
          </span>
        </div>

        {/* Estado */}
        <div className="mt-4 pt-4 border-t border-[#E6D3A3] flex items-center gap-3">
          <span className="text-sm text-[#353535] font-medium">Estado:</span>
          {perfil.activo ? (
            <span className="bg-[#10b981] text-white px-3 py-1 rounded-full text-xs font-bold">
              Activo
            </span>
          ) : (
            <span className="bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-bold">
              Inactivo
            </span>
          )}
        </div>

        {/* Descripción */}
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-[#231F20] mb-2">Descripción</h3>
          {isEditing ? (
            <Textarea
              value={editDescripcion}
              onChange={(e) => setEditDescripcion(e.target.value)}
              placeholder="Cuéntanos sobre tu negocio..."
              rows={3}
            />
          ) : (
            <p className="text-[#353535] text-sm">
              {perfil.descripcion || 'Sin descripción'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
