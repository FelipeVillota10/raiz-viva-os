'use client';

import { useEffect, useState } from 'react';
import { HeaderLider } from '../../components/HeaderLider';
import { Footer } from '../../components/Footer';
import { getToken } from '../../lib/auth';
import { API_URL } from '../../lib/auth';

interface DashboardData {
  total: number;
  pendientes: number;
  en_revision: number;
  aprobados: number;
  rechazados: number;
}

export default function LiderPanelPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/lider/dashboard/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f3e7]">
      <HeaderLider showNotification pendingCount={data?.pendientes || 0} />

      <main className="flex-1 px-4 py-8 max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-[#557149] mb-2">Bienvenido, Líder Territorial</h1>
        <p className="text-[#353535] mb-8">Resumen de solicitudes de registro en tu territorio</p>

        {loading ? (
          <div className="text-center py-12 text-[#353535]">Cargando...</div>
        ) : data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <DashboardCard
              label="Pendientes"
              count={data.pendientes}
              color="bg-[#f59e0b]"
              textColor="text-black"
              icon={<PendingIcon />}
            />
            <DashboardCard
              label="En Revisión"
              count={data.en_revision}
              color="bg-[#0cc0df]"
              textColor="text-white"
              icon={<ReviewIcon />}
            />
            <DashboardCard
              label="Aprobados"
              count={data.aprobados}
              color="bg-[#10b981]"
              textColor="text-white"
              icon={<CheckIcon />}
            />
            <DashboardCard
              label="Rechazados"
              count={data.rechazados}
              color="bg-[#ef4444]"
              textColor="text-white"
              icon={<XIcon />}
            />
          </div>
        ) : (
          <p className="text-center text-[#353535]">Error al cargar los datos.</p>
        )}

        <div className="flex justify-center mt-4">
          <button
            onClick={() => window.location.href = '/lider/aprobaciones'}
            className="bg-[#3b5630] hover:bg-[#2d6530] text-white font-semibold px-8 py-3 rounded-full transition shadow-md"
          >
            Ver Todas las Solicitudes
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function DashboardCard({ label, count, color, textColor, icon }: {
  label: string;
  count: number;
  color: string;
  textColor: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E6D3A3]">
      <div className="flex items-center justify-between mb-4">
        <span className={`${textColor} font-bold text-3xl`}>{count}</span>
        <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-[#353535] font-medium">{label}</p>
    </div>
  );
}

function PendingIcon() {
  return (
    <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}