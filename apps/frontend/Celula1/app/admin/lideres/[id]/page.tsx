'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/Input';
import { ArrowLeftIcon } from '../../../components/ui/Icons';
import { getToken, adminService } from '../../../services/api';
import { PerfilActor, AdminTerritorio } from '../../../models/types';

export default function LiderDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lider, setLider] = useState<PerfilActor | null>(null);
  const [territorios, setTerritorios] = useState<AdminTerritorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [editNombre, setEditNombre] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editActivo, setEditActivo] = useState(true);
  const [editTerritorioId, setEditTerritorioId] = useState('');
  const [editFoto, setEditFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const checkAuth = useCallback(() => {
    const token = getToken();
    if (!token) {
      router.push('/admin/login');
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload['es_admin']) {
        router.push('/admin/login');
        return false;
      }
    } catch {
      router.push('/admin/login');
      return false;
    }
    return true;
  }, [router]);

  useEffect(() => {
    if (!checkAuth()) return;

    const fetchData = async () => {
      try {
        const [liderData, territoriosData] = await Promise.all([
          adminService.getLider(Number(id)),
          adminService.getTerritorios(),
        ]);
        setLider(liderData);
        setTerritorios(territoriosData);
        setEditNombre(liderData.nombre);
        setEditEmail(liderData.usuario_email);
        setEditTelefono(liderData.telefono || '');
        setEditActivo(liderData.activo);
        setEditTerritorioId(String(liderData.territorio_id ?? ''));
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router, checkAuth]);

  const territoriosDisponibles = territorios.filter((t) =>
    t.administrador_id === null ||
    t.administrador_id === lider?.id_cliente ||
    !t.administrador_activo
  );

  const territorioOptions = [
    { value: '', label: 'Sin territorio' },
    ...territoriosDisponibles.map((t) => ({
      value: String(t.id_territorio),
      label: t.nombre_territorio,
    })),
  ];

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGuardar = async () => {
    if (!lider) return;
    setSaving(true);
    setError(null);

    const formData = new FormData();
    if (editNombre.trim() !== lider.nombre) formData.append('nombre', editNombre.trim());
    if (editEmail.trim() !== lider.usuario_email) formData.append('email', editEmail.trim());
    if (editTelefono.trim() !== (lider.telefono || '')) formData.append('telefono', editTelefono.trim());
    if (editActivo !== lider.activo) formData.append('activo', String(editActivo));
    if (editTerritorioId !== String(lider.territorio_id ?? '')) {
      formData.append('territorio_id', editTerritorioId || '');
    }
    if (editFoto) formData.append('foto_perfil', editFoto);

    if ([...formData.entries()].length === 0) {
      setIsEditing(false);
      setSaving(false);
      return;
    }

    try {
      const updated = await adminService.actualizarLider(lider.id_cliente, formData);
      setLider(updated);
      setEditNombre(updated.nombre);
      setEditEmail(updated.usuario_email);
      setEditTelefono(updated.telefono || '');
      setEditActivo(updated.activo);
      setEditTerritorioId(String(updated.territorio_id ?? ''));
      setEditFoto(null);
      setFotoPreview(null);
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
    if (!lider) return;
    setEditNombre(lider.nombre);
    setEditEmail(lider.usuario_email);
    setEditTelefono(lider.telefono || '');
    setEditActivo(lider.activo);
    setEditTerritorioId(String(lider.territorio_id ?? ''));
    setEditFoto(null);
    setFotoPreview(null);
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

  if (!lider) {
    return (
      <div className="px-4 py-8 max-w-3xl mx-auto w-full">
        <p className="text-center text-[#353535] py-12">Líder no encontrado.</p>
      </div>
    );
  }

  const fotoSrc = fotoPreview || lider.foto_perfil_url;

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto w-full">
      <button
        onClick={() => router.push('/admin/lideres')}
        className="flex items-center gap-2 text-[#3b5630] hover:text-[#2d6530] font-medium mb-6 transition cursor-pointer"
      >
        <ArrowLeftIcon size={20} />
        Volver a Líderes
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
        <h1 className="text-3xl font-bold text-[#557149]">Detalle del Líder</h1>
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
              title="Editar líder"
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
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-[#3b5630] flex items-center justify-center text-white font-bold text-2xl overflow-hidden shrink-0">
                {fotoSrc ? (
                  <img src={fotoSrc} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  lider.nombre.charAt(0).toUpperCase()
                )}
              </div>
              <label className="cursor-pointer bg-[#F4F1EA] border-2 border-[#E6D3A3] rounded-xl px-4 py-2 text-sm font-medium text-[#231F20] hover:border-[#3b5630] transition">
                Cambiar foto
                <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
              </label>
            </div>

            <Input
              label="Nombre"
              value={editNombre}
              onChange={(e) => setEditNombre(e.target.value)}
              placeholder="Nombre completo"
            />

            <Input
              label="Correo Electrónico"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
            />

            <Input
              label="Teléfono"
              value={editTelefono}
              onChange={(e) => setEditTelefono(e.target.value)}
              placeholder="Número de teléfono"
            />

            <Select
              label="Territorio"
              value={editTerritorioId}
              onChange={(e) => setEditTerritorioId(e.target.value)}
              options={territorioOptions}
            />

            <div className="flex items-center gap-3">
              <label className="text-base font-bold text-[#231F20]">Estado</label>
              <button
                type="button"
                onClick={() => setEditActivo(!editActivo)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  editActivo ? 'bg-[#10b981]' : 'bg-[#ef4444]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    editActivo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-[#353535]">
                {editActivo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-[#3b5630] flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                {lider.foto_perfil_url ? (
                  <img src={lider.foto_perfil_url} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  lider.nombre.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="font-semibold text-lg text-[#231F20]">{lider.nombre}</p>
                <p className="text-sm text-[#353535]">{lider.usuario_email}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-[#353535]">Teléfono</p>
              <p className="font-medium text-[#231F20]">{lider.telefono || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-[#353535]">Territorio</p>
              <p className="font-medium text-[#231F20]">{lider.territorio_nombre || 'Sin territorio'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
