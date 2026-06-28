/**
 * Página de mi perfil (View)
 * @celula - Celula1
 * Vista que utiliza usePerfil como ViewModel.
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePerfil } from '@/hooks/usePerfil';
import { useAuth } from '@/hooks/useAuth';
import { PerfilCard } from '@/components/ui/perfil/PerfilCard';
import { ServiciosList } from '@/components/ui/perfil/ServiciosList';
import { ErrorBanner } from '@/components/ui/base/ErrorBanner';
import { ToastSuccess } from '@/components/ui/base/ToastSuccess';
import { LoadingState } from '@/components/ui/base/LoadingState';

function ProfileActions({
  isEditing,
  saving,
  onStartEditing,
  onCancelEditing,
  onSave,
}: {
  isEditing: boolean;
  saving: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: () => void;
}) {
  if (isEditing) {
    return (
      <>
        <button
          type="button"
          onClick={onCancelEditing}
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
          onClick={onSave}
          disabled={saving}
          className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition disabled:opacity-50"
          title="Guardar cambios"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={onStartEditing}
      className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition"
      title="Editar perfil"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </button>
  );
}

export default function MiPerfilPage() {
  const router = useRouter();
  const { isAuthenticated, isActor, loading: authLoading } = useAuth();
  const {
    perfil,
    servicios,
    serviciosCatalogo,
    loading,
    saving,
    isEditing,
    error,
    toast,
    editNombre,
    editDescripcion,
    previewPerfil,
    previewPortada,
    showAddServicio,
    newServicioId,
    newServicioPrecio,
    addingServicio,
    perfilInputRef,
    portadaInputRef,
    setEditNombre,
    setEditDescripcion,
    setNewServicioId,
    setNewServicioPrecio,
    setShowAddServicio,
    loadData,
    startEditing,
    cancelEditing,
    saveChanges,
    handlePerfilFile,
    handlePortadaFile,
    handleAddServicio,
    handleDeleteServicio,
    normalizeImageUrl,
  } = usePerfil();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (!isActor) {
        router.push('/');
        return;
      }
      loadData();
    }
  }, [authLoading, isAuthenticated, isActor, router, loadData]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <LoadingState message="Cargando perfil..." />
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <p className="text-[#353535]">Perfil no encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#557149]">Mi Perfil</h1>
        <div className="flex gap-2">
          <ProfileActions
            isEditing={isEditing}
            saving={saving}
            onStartEditing={startEditing}
            onCancelEditing={cancelEditing}
            onSave={saveChanges}
          />
        </div>
      </div>

      {toast && <ToastSuccess message={toast} />}
      {error && <ErrorBanner message={error} />}

      <PerfilCard
        perfil={perfil}
        isEditing={isEditing}
        editNombre={editNombre}
        editDescripcion={editDescripcion}
        previewPerfil={previewPerfil}
        previewPortada={previewPortada}
        perfilInputRef={perfilInputRef}
        portadaInputRef={portadaInputRef}
        setEditNombre={setEditNombre}
        setEditDescripcion={setEditDescripcion}
        handlePerfilFile={handlePerfilFile}
        handlePortadaFile={handlePortadaFile}
        normalizeImageUrl={normalizeImageUrl}
      />

      <div className="bg-white rounded-2xl shadow-sm border-2 border-[#E6D3A3] px-6 pb-6 mt-4">
        <ServiciosList
          servicios={servicios}
          serviciosCatalogo={serviciosCatalogo}
          isEditing={isEditing}
          showAddServicio={showAddServicio}
          newServicioId={newServicioId}
          newServicioPrecio={newServicioPrecio}
          addingServicio={addingServicio}
          setNewServicioId={setNewServicioId}
          setNewServicioPrecio={setNewServicioPrecio}
          setShowAddServicio={setShowAddServicio}
          handleAddServicio={handleAddServicio}
          handleDeleteServicio={handleDeleteServicio}
        />
      </div>
    </div>
  );
}
