'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { perfilService, getToken } from '../services/api';
import { PerfilActor, ServicioPerfil, Servicio } from '../models/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function MiPerfilPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilActor | null>(null);
  const [servicios, setServicios] = useState<ServicioPerfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editFotoPerfil, setEditFotoPerfil] = useState<File | null>(null);
  const [editFotoPortada, setEditFotoPortada] = useState<File | null>(null);
  const [previewPerfil, setPreviewPerfil] = useState<string | null>(null);
  const [previewPortada, setPreviewPortada] = useState<string | null>(null);

  const [serviciosCatalogo, setServiciosCatalogo] = useState<Servicio[]>([]);
  const [showAddServicio, setShowAddServicio] = useState(false);
  const [newServicioId, setNewServicioId] = useState('');
  const [newServicioPrecio, setNewServicioPrecio] = useState('');
  const [addingServicio, setAddingServicio] = useState(false);

  const perfilInputRef = useRef<HTMLInputElement>(null);
  const portadaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login/inicio');
      return;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload['es_actor']) {
      router.push('/');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [perfilData, serviciosData, catalogoData] = await Promise.all([
        perfilService.getPerfil(),
        perfilService.getServicios(),
        perfilService.getServiciosCatalogo(),
      ]);
      console.log('Perfil loaded:', perfilData);
      console.log('Servicios loaded:', serviciosData);
      setPerfil(perfilData);
      setServicios(serviciosData);
      setServiciosCatalogo(catalogoData);
      setEditNombre(perfilData.nombre);
      setEditDescripcion(perfilData.descripcion || '');
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePerfilFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFotoPerfil(file);
      setPreviewPerfil(URL.createObjectURL(file));
    }
  };

  const handlePortadaFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFotoPortada(file);
      setPreviewPortada(URL.createObjectURL(file));
    }
  };

  const startEditing = () => {
    if (!perfil) return;
    setEditNombre(perfil.nombre);
    setEditDescripcion(perfil.descripcion || '');
    setEditFotoPerfil(null);
    setEditFotoPortada(null);
    setPreviewPerfil(null);
    setPreviewPortada(null);
    setError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditFotoPerfil(null);
    setEditFotoPortada(null);
    setPreviewPerfil(null);
    setPreviewPortada(null);
    setShowAddServicio(false);
    setError(null);
  };

  const saveChanges = async () => {
    if (!perfil) return;
    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('nombre', editNombre.trim());
      formData.append('descripcion', editDescripcion);
      if (editFotoPerfil) formData.append('foto_perfil', editFotoPerfil);
      if (editFotoPortada) formData.append('foto_portada', editFotoPortada);

      console.log('Sending profile update...');
      const updated = await perfilService.actualizarPerfil(formData);
      console.log('Profile updated:', updated);
      setPerfil(updated);
      setEditNombre(updated.nombre);
      setEditDescripcion(updated.descripcion || '');

      setIsEditing(false);
      setEditFotoPerfil(null);
      setEditFotoPortada(null);
      setPreviewPerfil(null);
      setPreviewPortada(null);
      setToast('Cambios guardados correctamente');
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleAddServicio = async () => {
    if (!newServicioId) return;
    setAddingServicio(true);
    setError(null);
    try {
      const precio = newServicioPrecio ? parseFloat(newServicioPrecio) : undefined;
      console.log('Adding servicio:', newServicioId, precio);
      const nuevo = await perfilService.addServicio(parseInt(newServicioId), precio);
      setServicios(prev => [...prev, nuevo]);
      setNewServicioId('');
      setNewServicioPrecio('');
      setShowAddServicio(false);
    } catch (err: any) {
      console.error('Error adding servicio:', err);
      setError(err.message || 'Error al añadir servicio');
    } finally {
      setAddingServicio(false);
    }
  };

  const handleDeleteServicio = async (id: number) => {
    setError(null);
    try {
      console.log('Deleting servicio:', id);
      await perfilService.deleteServicio(id);
      setServicios(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      console.error('Error deleting servicio:', err);
      setError(err.message || 'Error al eliminar servicio');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
        <header className="flex justify-between items-center px-4 py-2 h-16 bg-[#3b5630] text-white">
          <div className="flex items-center gap-2">
            <Image src="/raiz_header.png" alt="Logo" width={256} height={256} className="w-64 h-64 object-contain mt-2" />
            <span className="font-medium text-base hidden sm:inline self-center">Mi Perfil</span>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#353535]">Cargando perfil...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
        <header className="flex justify-between items-center px-4 py-2 h-16 bg-[#3b5630] text-white">
          <div className="flex items-center gap-2">
            <Image src="/raiz_header.png" alt="Logo" width={256} height={256} className="w-64 h-64 object-contain mt-2" />
            <span className="font-medium text-base hidden sm:inline self-center">Mi Perfil</span>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#353535]">Perfil no encontrado</p>
        </div>
        <Footer />
      </div>
    );
  }

  const normalizeUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${API_URL}${path}`;
  };

  const fotoPerfilSrc = previewPerfil || normalizeUrl(perfil.foto_perfil_url) || normalizeUrl(perfil.foto_perfil) || '/RaizLogoCirculo.png';
  const fotoPortadaSrc = previewPortada || normalizeUrl(perfil.foto_portada_url) || normalizeUrl(perfil.foto_portada);

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
      <header className="flex justify-between items-center px-4 py-2 h-16 bg-[#3b5630] text-white">
        <div className="flex items-center gap-2">
          <Image
            src="/raiz_header.png"
            alt="Logo de Raiz Viva"
            width={256}
            height={256}
            loading="eager"
            className="w-64 h-64 object-contain mt-2"
          />
          <span className="font-medium text-base hidden sm:inline self-center">Mi Perfil</span>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition"
                title="Cancelar cambios"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <button
                type="button"
                onClick={saveChanges}
                disabled={saving}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition disabled:opacity-50"
                title="Guardar cambios"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition"
              title="Editar perfil"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {toast && (
          <div className="mb-4 p-4 bg-[#10b981] text-white rounded-xl text-center font-medium">
            {toast}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-[#E53935]/10 border border-[#E53935] rounded-xl text-center">
            <p className="text-[#E53935] font-medium">{error}</p>
          </div>
        )}

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
                ({perfil.reputacion?.toFixed(1) || '0.0'})
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

            {/* Servicios */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-[#231F20]">Servicios / Negocios</h3>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setShowAddServicio(!showAddServicio)}
                    className="text-sm text-[#3b5630] hover:underline font-medium"
                  >
                    + Añadir
                  </button>
                )}
              </div>

              {showAddServicio && isEditing && (
                <div className="mb-4 p-4 bg-[#F4F1EA] rounded-xl border border-[#E6D3A3]">
                  <Select
                    label="Servicio"
                    value={newServicioId}
                    onChange={(e) => setNewServicioId(e.target.value)}
                    options={[
                      { value: '', label: 'Seleccione un servicio' },
                      ...serviciosCatalogo
                        .filter(s => !servicios.some(ss => ss.servicio_id === s.id))
                        .map(s => ({ value: String(s.id), label: s.nombre })),
                    ]}
                  />
                  <Input
                    label="Precio acordado (opcional)"
                    type="number"
                    value={newServicioPrecio}
                    onChange={(e) => setNewServicioPrecio(e.target.value)}
                    placeholder="Ej: 20000"
                  />
                  <div className="flex gap-2 mt-3">
                    <Button type="button" onClick={handleAddServicio} size="sm" variant="primary" isLoading={addingServicio}>
                      Añadir
                    </Button>
                    <Button type="button" onClick={() => setShowAddServicio(false)} size="sm" variant="ghost">
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {servicios.length === 0 ? (
                <p className="text-sm text-gray-400">Sin servicios registrados</p>
              ) : (
                <div className="space-y-2">
                  {servicios.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-[#F4F1EA] rounded-lg">
                      <div>
                        <p className="font-medium text-[#231F20]">{s.nombre}</p>
                        {s.precio_acordado && (
                          <p className="text-sm text-[#3b5630]">
                            ${Number(s.precio_acordado).toLocaleString('es-CO')} {s.unidad ? `/ ${s.unidad}` : ''}
                          </p>
                        )}
                      </div>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleDeleteServicio(s.id)}
                          className="text-[#E53935] hover:text-red-700 p-1"
                          title="Eliminar servicio"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
