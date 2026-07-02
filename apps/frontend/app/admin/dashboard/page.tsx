import { fetchGrowthMetrics } from "@/services/growth";
import { EstadisticaCard } from "@/components/dashboard/EstadisticaCard";
import { DashboardError } from "@/components/dashboard/DashboardError";
import { Footer } from '@/components/shared/Footer';

function fmtMoney(val: string | number): string {
  const n = typeof val === "string" ? parseFloat(val) : val;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toLocaleString("es-CO")}`;
}

function fmtNum(n: number): string {
  return n.toLocaleString("es-CO");
}

export default async function DashboardPage() {
  let metrics = null;
  let error: string | null = null;

  try {
    metrics = await fetchGrowthMetrics();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  const porcentajeLocal =
    metrics && parseFloat(metrics.ventas_totales) > 0
      ? ((parseFloat(metrics.ventas_actores_locales) / parseFloat(metrics.ventas_totales)) * 100).toFixed(1)
      : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f0e8", display: "flex", flexDirection: "column" }}>
      <main style={{
        flex: 1,
        padding: "40px",
        maxWidth: "1200px",
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "36px",
        boxSizing: "border-box",
      }}>

        {/* Header */}
        <div style={{ borderBottom: "1.5px solid #ddd6c4", paddingBottom: "20px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#2d3e28", margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: "13px", color: "#8c9a80", margin: "4px 0 0" }}>
            Métricas generales de la plataforma
          </p>
        </div>

        {error ? (
          <DashboardError message={error} />
        ) : metrics ? (
          <>
            {/* Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}>
              <EstadisticaCard label="Usuarios activos" value={fmtNum(metrics.usuarios_activos)} />
              <EstadisticaCard label="Actores activos" value={fmtNum(metrics.actores_activos)} />
              <EstadisticaCard label="Eventos realizados" value={fmtNum(metrics.eventos_realizados)} />
              <EstadisticaCard label="Ventas totales" value={fmtMoney(metrics.ventas_totales)} accent sublabel="Eventos + experiencias" />
              <EstadisticaCard label="Ventas actores locales" value={fmtMoney(metrics.ventas_actores_locales)} accent sublabel="Solo actores locales" />
            </div>

            {/* Detalle ventas */}
            <div style={{
              background: "#ffffff",
              borderRadius: "14px",
              padding: "28px 32px",
              border: "1.5px solid #e8e0cc",
              boxShadow: "0 2px 12px rgba(59,86,48,0.06)",
            }}>
              <p style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#8c9a80",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "0 0 20px",
              }}>
                Detalle de ventas
              </p>
            

              <div style={{ display: "flex", gap: "0", flexWrap: "wrap" }}>
                {[
                  { label: "Ventas totales", value: fmtMoney(metrics.ventas_totales), color: "#2d3e28" },
                  { label: "Actores locales", value: fmtMoney(metrics.ventas_actores_locales), color: "#3b5630" },
                  { label: "% local / total", value: porcentajeLocal ? `${porcentajeLocal}%` : "—", color: "#557149" },
                ].map((item, i) => (
                  <div key={i} style={{
                    flex: "1 1 140px",
                    padding: "0 28px",
                    borderLeft: i > 0 ? "1.5px solid #e8e0cc" : "none",
                  }}>
                    <p style={{
                      fontSize: "11px",
                      color: "#8c9a80",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      margin: "0 0 6px",
                    }}>
                      {item.label}
                    </p>
                    <p style={{
                      fontSize: "26px",
                      fontWeight: 700,
                      color: item.color,
                      margin: 0,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
        {/* Ventas por territorio */}
                {metrics?.ventas_por_territorio && metrics.ventas_por_territorio.length > 0 && (
                <div style={{
                    background: "#ffffff",
                    borderRadius: "14px",
                    padding: "28px 32px",
                    border: "1.5px solid #e8e0cc",
                    boxShadow: "0 2px 12px rgba(59,86,48,0.06)",
                }}>
                    <p style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#8c9a80",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    margin: "0 0 20px",
                    }}>
                    Ventas por territorio
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {metrics.ventas_por_territorio.map((t: {
                        id: number;
                        nombre: string;
                        region: string;
                        total: number;
                    }) => {
                        const maxTotal = Math.max(...metrics.ventas_por_territorio.map((x: { total: number }) => x.total));
                        const pct = maxTotal > 0 ? (t.total / maxTotal) * 100 : 0;

                        return (
                        <div key={t.id}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                            <div>
                                <span style={{ fontSize: "14px", fontWeight: 600, color: "#2d3e28" }}>
                                {t.nombre}
                                </span>
                                <span style={{ fontSize: "11px", color: "#8c9a80", marginLeft: "8px" }}>
                                {t.region}
                                </span>
                            </div>
                            <span style={{
                                fontSize: "15px",
                                fontWeight: 700,
                                color: "#3b5630",
                                fontVariantNumeric: "tabular-nums",
                            }}>
                                {fmtMoney(t.total)}
                            </span>
                            </div>

                            {/* Barra de progreso */}
                            <div style={{
                            height: "6px",
                            background: "#f0ece3",
                            borderRadius: "99px",
                            overflow: "hidden",
                            }}>
                            <div style={{
                                height: "100%",
                                width: `${pct}%`,
                                background: "#3b5630",
                                borderRadius: "99px",
                                transition: "width 0.4s ease",
                            }} />
                            </div>
                        </div>
                        );
                    })}
                    </div>
                </div>
                )}
      </main>
    </div>
  );
}