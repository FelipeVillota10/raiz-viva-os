//export default function DashboardFinancieroPage() {
//  return <div>Dashboard Financiero</div>
//}

//http://localhost:3000/productor/dashboard
'use client';

import { useState, useEffect } from 'react';

interface DashboardData {
  saldoDisponible: number;
  ingresosNetosTotales: number;
  ingresosPorMes: {
    mes: string;
    valor: number;
  }[];
  ventasRecientes: {
    fecha: string;
    id: string;
    valorneto: number;
  }[];
}

//datos mock
const MOCK_DASHBOARD_DATA: DashboardData = {
  saldoDisponible: 1255000.00,
  ingresosNetosTotales: 1255000.00,
  ingresosPorMes: [
    { mes: 'May 2026', valor: 85000 },
    { mes: 'Jun 2026', valor: 150000 },
    { mes: 'Jul 2026', valor: 225000 },
    { mes: 'Ago 2026', valor: 75000 },
    { mes: 'Sep 2026', valor: 75000 },
    { mes: 'Dec 2026', valor: 120000 },
  ],
  ventasRecientes: [
    { fecha: '23/06/2026', id: 'RVOS-987654', valorneto: 150000 },
    { fecha: '22/06/2026', id: 'RVOS-987653', valorneto: 225000 },
    { fecha: '19/06/2026', id: 'RVOS-987652', valorneto: 75000 },
    { fecha: '17/06/2026', id: 'RVOS-987651', valorneto: 75000 },
  ],
};

//grafica de barras
function BarraMes({ mes, valor, maxValor }: { mes: string; valor: number; maxValor: number }) {
  const barHeight = (valor / maxValor) * 140;
  return (
    <div className="flex-1 flex flex-col items-center min-w-[50px] sm:min-w-[70px]">
      <div className="w-full max-w-[60px] sm:max-w-[80px] bg-[#e8e0d0] rounded-t-md h-[140px] relative overflow-hidden mx-auto">
        <div
          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#6b7c45] to-[#8a9d6a] transition-all duration-500 ease-out"
          style={{ height: `${barHeight}px`, minHeight: barHeight > 0 ? '4px' : '0px' }}
        />
      </div>
      <div className="text-[0.65rem] sm:text-[0.7rem] font-medium text-[#6b7280] mt-2 text-center whitespace-nowrap">
        {mes}
      </div>
      <div className="text-[0.7rem] sm:text-[0.75rem] font-semibold text-[#1a1a1a] mt-0.5">
        ${valor.toLocaleString('es-CO')}
      </div>
    </div>
  );
}

export default function DashboardFinanciero() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        // aqui iria la llamada real al back
        const data = MOCK_DASHBOARD_DATA;
        setDashboardData(data);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setDashboardData(MOCK_DASHBOARD_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#f9f3e7] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#6b7c45] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm sm:text-base text-[#6b7280]">Cargando información financiera...</p>
        </div>
      </div>
    );
  }

  const { saldoDisponible, ingresosNetosTotales, ingresosPorMes, ventasRecientes } = dashboardData;
  const maxValor = Math.max(...ingresosPorMes.map((item) => item.valor), 1);

  return (
    <div className="min-h-screen bg-[#f9f3e7] flex justify-center items-start p-3 sm:p-4 md:p-6 relative">
      <span className="absolute top-2 left-2 text-4xl opacity-20 pointer-events-none select-none">🍁</span>
      <span className="absolute top-2 right-2 text-4xl opacity-20 pointer-events-none select-none rotate-12">🍂</span>
      <span className="absolute bottom-4 left-4 text-3xl opacity-10 pointer-events-none select-none">🌿</span>
      <span className="absolute bottom-4 right-4 text-3xl opacity-10 pointer-events-none select-none rotate-45">🍃</span>

      {/* Tarjeta principal */}
      <div className="w-full max-w-[480px] sm:max-w-[640px] md:max-w-[768px] lg:max-w-[900px] mx-auto bg-white rounded-3xl sm:rounded-[44px] shadow-lg overflow-hidden p-4 sm:p-6 md:p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-3 mb-6 sm:mb-7 pb-2 border-b border-[#e8e0d0]">
          <h1 className="text-xl sm:text-2xl md:text-[1.75rem] font-semibold tracking-tight text-[#1a1a1a]">
            Mi Dashboard Financiero
          </h1>
        </div>

        {/* Sección Saldo Disponible */}
        <div className="bg-[#f5f0e8] rounded-2xl sm:rounded-[32px] p-4 sm:p-5 md:p-6 mb-6 sm:mb-7 shadow-md border border-[#e8e0d0]">
          <div className="text-[0.75rem] sm:text-[0.85rem] font-medium uppercase tracking-wide text-[#6b7280] mb-2 sm:mb-3">
            Saldo Disponible para Retirar
          </div>
          <div className="text-2xl sm:text-3xl md:text-[2.8rem] font-bold tracking-[-0.5px] mb-2 sm:mb-3 text-[#1a1a1a]">
            ${saldoDisponible.toLocaleString('es-CO')} <span className="text-base sm:text-lg md:text-[1.2rem] font-medium">COP</span>
          </div>
          <div className="text-[0.8rem] sm:text-[0.9rem] pt-2 sm:pt-3 border-t border-[#e0d8c8] text-[#4b5563]">
            Ingresos Netos Totales: ${ingresosNetosTotales.toFixed(2)} COP
          </div>
        </div>

        {/* Gráfico de barras */}
        <div className="mb-6 sm:mb-7">
          <h2 className="text-sm sm:text-[0.95rem] font-semibold text-[#1a1a1a] mb-3 sm:mb-4">
            Ingresos Netos (Últimos 6 Meses)
          </h2>
          
          <div className="flex flex-wrap justify-center sm:flex-nowrap items-end gap-2 sm:gap-3 md:gap-4">
            {ingresosPorMes.map((item, idx) => (
              <BarraMes key={idx} mes={item.mes} valor={item.valor} maxValor={maxValor} />
            ))}
          </div>
          
          {/* Etiquetas auxiliares */}
          <div className="hidden sm:flex justify-between text-[0.65rem] text-[#9ca3af] mt-4 px-1">
            {ingresosPorMes.map((item, idx) => (
              <span key={idx} className="flex-1 text-center font-mono text-[0.6rem] sm:text-[0.65rem]">
                {item.mes}
              </span>
            ))}
          </div>
        </div>

        {/* Tabla de Ventas Realizadas */}
        <div>
          <h2 className="text-sm sm:text-[0.95rem] font-semibold text-[#1a1a1a] mb-3">
            Ventas Realizadas (Últimas 5)
          </h2>
          
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-xs sm:text-sm border-collapse min-w-[300px]">
              <thead>
                <tr className="border-b border-[#e8e0d0] text-left">
                  <th className="py-2 pr-3 sm:pr-4 font-semibold text-[#6b7280] text-[0.7rem] sm:text-[0.8rem]">Fecha</th>
                  <th className="py-2 pr-3 sm:pr-4 font-semibold text-[#6b7280] text-[0.7rem] sm:text-[0.8rem]">ID</th>
                  <th className="py-2 font-semibold text-[#6b7280] text-[0.7rem] sm:text-[0.8rem] text-right">Valor Neto</th>
                </tr>
              </thead>
              <tbody>
                {ventasRecientes.map((venta, idx) => (
                  <tr key={idx} className="border-b border-[#f1f5f9] hover:bg-[#faf8f3] transition">
                    <td className="py-2 sm:py-2.5 pr-3 sm:pr-4 text-[0.75rem] sm:text-[0.85rem] text-[#1a1a1a]">{venta.fecha}</td>
                    <td className="py-2 sm:py-2.5 pr-3 sm:pr-4 text-[0.7rem] sm:text-[0.85rem] font-mono text-[#6b7c45]">{venta.id}</td>
                    <td className="py-2 sm:py-2.5 text-right font-medium text-[0.75rem] sm:text-[0.85rem] text-[#1a1a1a]">${venta.valorneto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[0.65rem] sm:text-[0.7rem] text-[#9ca3af] mt-3 sm:mt-4 italic">
            *Las ventas realizadas son las del último día.
          </p>
        </div>
      </div>
    </div>
  );
}