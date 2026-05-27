'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ArrowLeftIcon } from '../../../components/ui/Icons';
import { getToken, adminService } from '../../../services/api';
import { AdminTerritorio } from '../../../models/types';

export default function TerritorioDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [territorio, setTerritorio] = useState<AdminTerritorio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [editNombre, setEditNombre] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editEstadoActivo, setEditEstadoActivo] = useState(true);
  const [editAdminActivo, setEditAdminActivo] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload['es_admin']) {
        router.push('/admin/login');
        return;
      }
    } catch {
      router.push('/admin/login');
      return;
    }

    const fetchTerritorio = async () => {
      try {
        const data = await adminService.getTerritorio(Number(id));
        setTerritorio(data);
        setEditNombre(data.nombre_territorio);
        setEditRegion(data.region);
        setEditEstadoActivo(data.estado_nombre?.toLowerCase() === 'activo');
        setEditAdminActivo(data.administrador_activo);
      } catch (err: any) {
        setError(err.message || 'Error al cargar territorio');
      } finally {
        setLoading(false);
      }
    };

    fetchTerritorio();
  }, [id, router]);

  const handleGuardar = async () => {
    if (!territorio) return;
    setSaving(true);
    setError(null);

    const payload: Record<string, any> = {};
    if (editNombre.trim() !== territorio.nombre_territorio) payload.nombre_territorio = editNombre.trim();
    if (editRegion.trim() !== territorio.region) payload.region = editRegion.trim();
    const estadoActivoActual = territorio.estado_nombre?.toLowerCase() === 'activo';
    if (editEstadoActivo !== estadoActivoActual) payload.id_estado = editEstadoActivo ? 4 : 5;
    if (editAdminActivo !== territorio.administrador_activo) payload.administrador_activo = editAdminActivo;

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      setSaving(false);
      return;
    }

    try {
      const updated = await adminService.actualizarTerritorio(territorio.id_territorio, payload);
      setTerritorio(updated);
      setIsEditing(false);
      setToast('Cambios guardados correctamente');
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    if (!territorio) return;
    setEditNombre(territorio.nombre_territorio);
    setEditRegion(territorio.region);
    setEditEstadoActivo(territorio.estado_nombre?.toLowerCase() === 'activo');
    setEditAdminActivo(territorio.administrador_activo);
    setIsEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="px-4 py-8 max-w-3xl mx-auto w-full">
        <p className="text-center text-[#353535] py-12">Cargando...</p>
      </div>
    );
  }

  if (!territorio) {
    return (
      <div className="px-4 py-8 max-w-3xl mx-auto w-full">
        <p className="text-center text-[#353535] py-12">Territorio no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto w-full">
      <button
        onClick={() => router.push('/admin/territorios')}
        className="flex items-center gap-2 text-[#3b5630] hover:text-[#2d6530] font-medium mb-6 transition cursor-pointer"
      >
        <ArrowLeftIcon size={20} />
        Volver a Territorios
      </button>

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

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#557149]">Detalle del Territorio</h1>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                className="bg-white/20 hover:bg-white/30 text-[#231F20] p-2 rounded-full transition border border-[#E6D3A3]"
                title="Cancelar cambios"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleGuardar}
                disabled={saving}
                className="bg-white/20 hover:bg-white/30 text-[#231F20] p-2 rounded-full transition border border-[#E6D3A3] disabled:opacity-50"
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
              onClick={() => setIsEditing(true)}
              className="bg-white/20 hover:bg-white/30 text-[#231F20] p-2 rounded-full transition border border-[#E6D3A3]"
              title="Editar territorio"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
        </div>
      </div>

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
          <div className="space-y-4">
            <Input
              label="Nombre del Territorio"
              value={editNombre}
              onChange={(e) => setEditNombre(e.target.value)}
              placeholder="Ej: Buitrera"
            />
            <Input
              label="Región"
              value={editRegion}
              onChange={(e) => setEditRegion(e.target.value)}
              placeholder="Ej: Zona Rural Palmira"
            />
            <div className="flex items-center gap-3">
              <label className="text-base font-bold text-[#231F20]">Estado del territorio</label>
              <button
                type="button"
                onClick={() => setEditEstadoActivo(!editEstadoActivo)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  editEstadoActivo ? 'bg-[#10b981]' : 'bg-[#ef4444]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    editEstadoActivo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-[#353535]">
                {editEstadoActivo ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            {territorio.administrador_nombre && (
              <div className="pt-2 border-t border-[#E6D3A3]">
                <p className="text-sm font-bold text-[#231F20] mb-2">
                  Administrador: {territorio.administrador_nombre}
                </p>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-[#353535]">Estado del líder</label>
                  <button
                    type="button"
                    onClick={() => setEditAdminActivo(!editAdminActivo)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      editAdminActivo ? 'bg-[#10b981]' : 'bg-[#ef4444]'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        editAdminActivo ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-[#353535]">
                    {editAdminActivo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#353535]">Nombre</p>
              <p className="font-medium text-[#231F20]">{territorio.nombre_territorio}</p>
            </div>
            <div>
              <p className="text-sm text-[#353535]">Región</p>
              <p className="font-medium text-[#231F20]">{territorio.region}</p>
            </div>
            <div>
              <p className="text-sm text-[#353535]">Estado</p>
              <span className={`inline-block mt-1 text-white px-3 py-1 rounded-full text-xs font-bold capitalize ${
                territorio.estado_nombre?.toLowerCase() === 'activo' ? 'bg-[#10b981]' : 'bg-[#ef4444]'
              }`}>
                {territorio.estado_nombre}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
