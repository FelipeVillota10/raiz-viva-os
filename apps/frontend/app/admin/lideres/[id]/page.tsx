/**
 * Página de detalle de líder (View)
 * @celula - Celula1
 * Vista que utiliza useLiderDetalle como ViewModel.
 */

'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useLiderDetalle } from '@/hooks/useLiderDetalle';
import { LiderDetalleHeader } from '@/components/ui/gestionarlider/LiderDetalleHeader';
import { LiderDetalleView } from '@/components/ui/gestionarlider/LiderDetalleView';
import { LiderDetalleForm } from '@/components/ui/gestionarlider/LiderDetalleForm';
import { BackButton } from '@/components/ui/base/BackButton';
import { ToastSuccess } from '@/components/ui/base/ToastSuccess';
import { ErrorBanner } from '@/components/ui/base/ErrorBanner';
import { LoadingState } from '@/components/ui/base/LoadingState';

export default function LiderDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { checkAuth } = useAdminAuth();

  const {
    lider,
    territoriosDisponibles,
    loading,
    saving,
    error,
    toast,
    isEditing,
    editNombre,
    editEmail,
    editTelefono,
    editActivo,
    editTerritorioId,
    editFoto,
    fotoPreview,
    setEditNombre,
    setEditEmail,
    setEditTelefono,
    setEditActivo,
    setEditTerritorioId,
    setIsEditing,
    handleFotoChange,
    handleGuardar,
    cancelEditing,
    loadData,
  } = useLiderDetalle();

  useEffect(() => {
    if (!checkAuth()) return;
    loadData(Number(id));
  }, [id, checkAuth, loadData]);

  if (loading) {
    return (
      <div className="px-4 py-8 max-w-3xl mx-auto w-full">
        <LoadingState message="Cargando..." />
      </div>
    );
  }

  if (!lider) {
    return (
      <div className="px-4 py-8 max-w-3xl mx-auto w-full">
        <BackButton onClick={() => router.push('/admin/lideres')} label="Volver a Líderes" />
        <p className="text-center text-[#353535] py-12">Líder no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto w-full">
      <BackButton onClick={() => router.push('/admin/lideres')} label="Volver a Líderes" />
      {toast && <ToastSuccess message={toast} />}
      {error && <ErrorBanner message={error} />}

      <LiderDetalleHeader
        isEditing={isEditing}
        saving={saving}
        onEdit={() => setIsEditing(true)}
        onCancel={cancelEditing}
        onSave={handleGuardar}
      />

      <div className="bg-white rounded-2xl shadow-sm border-2 border-[#E6D3A3] p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#231F20] mb-4">Información General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[#353535]">ID del Líder</p>
            <p className="font-medium text-[#231F20]">{lider.id_cliente}</p>
          </div>
          <div>
            <p className="text-sm text-[#353535]">Estado</p>
            <span className={`inline-block mt-1 text-white px-3 py-1 rounded-full text-xs font-bold ${
              lider.activo ? 'bg-[#10b981]' : 'bg-[#ef4444]'
            }`}>
              {lider.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border-2 border-[#E6D3A3] p-6">
        <h2 className="text-xl font-semibold text-[#231F20] mb-4">Datos del Líder</h2>
        {isEditing ? (
          <LiderDetalleForm
            lider={lider}
            editNombre={editNombre}
            editEmail={editEmail}
            editTelefono={editTelefono}
            editActivo={editActivo}
            editTerritorioId={editTerritorioId}
            editFoto={editFoto}
            fotoPreview={fotoPreview}
            territoriosDisponibles={territoriosDisponibles}
            onChangeNombre={setEditNombre}
            onChangeEmail={setEditEmail}
            onChangeTelefono={setEditTelefono}
            onChangeActivo={setEditActivo}
            onChangeTerritorioId={setEditTerritorioId}
            onChangeFoto={handleFotoChange}
          />
        ) : (
          <LiderDetalleView lider={lider} />
        )}
      </div>
    </div>
  );
}
