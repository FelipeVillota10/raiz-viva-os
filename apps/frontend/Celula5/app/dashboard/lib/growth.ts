export interface GrowthMetrics {
  usuarios_activos: number;
  actores_activos: number;
  eventos_realizados: number;
  ventas_totales: string;
  ventas_actores_locales: string;
}

export async function fetchGrowthMetrics(): Promise<GrowthMetrics> {
  const res = await fetch("http://127.0.0.1:8000/api/growth/", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Error al obtener métricas: ${res.status}`);
  }

  return res.json();
}