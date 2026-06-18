/**
 * Página de detalle de territorio (View)
 * @celula - Celula1
 * Vista que utiliza useTerritorioDetalle como ViewModel.
 */

'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useTerritorioDetalle } from '@/hooks/useTerritorioDetalle';
import { TerritorioDetalleHeader } from '@/components/ui/gestionarterritorio/TerritorioDetalleHeader';
import { TerritorioDetalleView } from '@/components/ui/gestionarterritorio/TerritorioDetalleView';
import { TerritorioDetalleForm } from '@/components/ui/gestionarterritorio/TerritorioDetalleForm';
import { BackButton } from '@/components/ui/base/BackButton';
import { ToastSuccess } from '@/components/ui/base/ToastSuccess';
import { ErrorBanner } from '@/components/ui/base/ErrorBanner';
import { LoadingState } from '@/components/ui/base/LoadingState';

export default function TerritorioDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { checkAuth } = useAdminAuth();

  const {
    territorio,
    loading,
    saving,
    error,
    toast,
    isEditing,
    editNombre,
    editRegion,
    editEstadoActivo,
    editAdminActivo,
    setEditNombre,
    setEditRegion,
    setEditEstadoActivo,
    setEditAdminActivo,
    setIsEditing,
    handleGuardar,
    cancelEditing,
    loadData,
  } = useTerritorioDetalle();

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

  if (!territorio) {
    return (
      <div className="px-4 py-8 max-w-3xl mx-auto w-full">
        <BackButton onClick={() => router.push('/admin/territorios')} label="Volver a Territorios" />
        <p className="text-center text-[#353535] py-12">Territorio no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto w-full">
      <BackButton onClick={() => router.push('/admin/territorios')} label="Volver a Territorios" />
      {toast && <ToastSuccess message={toast} />}
      {error && <ErrorBanner message={error} />}

      <TerritorioDetalleHeader
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
            <p className="text-sm text-[#353535]">ID del Territorio</p>
            <p className="font-medium text-[#231F20]">{territorio.id_territorio}</p>
          </div>
          <div>
            <p className="text-sm text-[#353535]">Administrador</p>
            <p className="font-medium text-[#231F20]">{territorio.administrador_nombre}</p>
          </div>
          <div>
            <p className="text-sm text-[#353535]">Estado del líder</p>
            <span className={`inline-block mt-1 text-white px-3 py-1 rounded-full text-xs font-bold ${
              territorio.administrador_activo ? 'bg-[#10b981]' : 'bg-[#ef4444]'
            }`}>
              {territorio.administrador_activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border-2 border-[#E6D3A3] p-6">
        <h2 className="text-xl font-semibold text-[#231F20] mb-4">Datos del Territorio</h2>
        {isEditing ? (
          <TerritorioDetalleForm
            territorio={territorio}
            editNombre={editNombre}
            editRegion={editRegion}
            editEstadoActivo={editEstadoActivo}
            editAdminActivo={editAdminActivo}
            onChangeNombre={setEditNombre}
            onChangeRegion={setEditRegion}
            onChangeEstadoActivo={setEditEstadoActivo}
            onChangeAdminActivo={setEditAdminActivo}
          />
        ) : (
          <TerritorioDetalleView territorio={territorio} />
        )}
      </div>
    </div>
  );
}
