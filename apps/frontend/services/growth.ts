export interface GrowthMetrics {
  usuarios_activos: number;
  actores_activos: number;
  eventos_realizados: number;
  ventas_totales: string;
  ventas_actores_locales: string;
  ventas_por_territorio: {
    id: number;
    nombre: string;
    region: string;
    total: number;
  }[];
}

export async function fetchGrowthMetrics(): Promise<GrowthMetrics> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/growth/`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Error al obtener métricas: ${res.status}`);
  }
  

  return res.json();
}
