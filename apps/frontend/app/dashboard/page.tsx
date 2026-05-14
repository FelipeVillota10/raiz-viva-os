import { fetchGrowthMetrics } from "./lib/growth";
import { EstadisticaCard } from "./components/EstadisticaCard";
import { DashboardError } from "./components/DashboardError";
import Image from "next/image";

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

    const today = new Date().toLocaleDateString("es-CO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div style={{ minHeight: "100vh", background: "#f9f3e7", display: "flex", flexDirection: "column" }}>

            <header
                style={{
                    background: "#3b5630",
                    color: "#fff",
                    padding: "0 40px",
                    height: "64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        background: "#ffffff",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        <Image
                            src="/arbol.jpg"
                            alt="Logo Raíz Viva"
                            width={42}
                            height={42}
                            style={{ objectFit: "cover", borderRadius: "50%" }}
                        />
                    </div>
                    <div>
                        <p style={{ fontSize: "16px", fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
                            Raíz Viva
                        </p>
                        <p style={{ fontSize: "11px", opacity: 0.65, margin: 0, letterSpacing: "0.04em" }}>
                            Panel de control
                        </p>
                    </div>
                </div>

                <p style={{ fontSize: "12px", opacity: 0.65, margin: 0, textTransform: "capitalize" }}>
                    {today}
                </p>
            </header>


            <main
                style={{
                    flex: 1,
                    padding: "36px 40px",
                    maxWidth: "1300px",
                    width: "100%",
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "32px",
                    boxSizing: "border-box",
                }}
            >

                <div>
                    <h1
                        style={{
                            fontSize: "26px",
                            fontWeight: 700,
                            color: "#3b5630",
                            margin: 0,
                        }}
                    >
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

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "16px",
                            }}
                        >
                            <EstadisticaCard
                                label="Usuarios activos"
                                value={fmtNum(metrics.usuarios_activos)}
                                icon=""
                            />
                            <EstadisticaCard
                                label="Actores activos"
                                value={fmtNum(metrics.actores_activos)}
                                icon=""
                            />
                            <EstadisticaCard
                                label="Eventos realizados"
                                value={fmtNum(metrics.eventos_realizados)}
                                icon=""
                            />
                            <EstadisticaCard
                                label="Ventas totales"
                                value={fmtMoney(metrics.ventas_totales)}
                                icon=""
                                accent
                                sublabel="Eventos + experiencias"
                            />
                            <EstadisticaCard
                                label="Ventas actores locales"
                                value={fmtMoney(metrics.ventas_actores_locales)}
                                icon=""
                                accent
                                sublabel="Solo actores locales"
                            />
                        </div>

                        <div
                            style={{
                                background: "#ffffff",
                                borderRadius: "14px",
                                padding: "20px 24px",
                                border: "1.5px solid #e8e0cc",
                                boxShadow: "0 2px 12px rgba(59,86,48,0.08)",
                            }}
                        >
                            <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#557149", margin: "0 0 16px" }}>
                                Detalle de ventas
                            </h2>
                            <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
                                <div>
                                    <p style={{ fontSize: "11px", color: "#8c9a80", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                                        Ventas totales
                                    </p>
                                    <p style={{ fontSize: "22px", fontWeight: 700, color: "#0cc0df", margin: "4px 0 0" }}>
                                        {fmtMoney(metrics.ventas_totales)}
                                    </p>
                                </div>
                                <div style={{ width: "1px", background: "#e8e0cc" }} />
                                <div>
                                    <p style={{ fontSize: "11px", color: "#8c9a80", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                                        Actores locales
                                    </p>
                                    <p style={{ fontSize: "22px", fontWeight: 700, color: "#557149", margin: "4px 0 0" }}>
                                        {fmtMoney(metrics.ventas_actores_locales)}
                                    </p>
                                </div>
                                <div style={{ width: "1px", background: "#e8e0cc" }} />
                                <div>
                                    <p style={{ fontSize: "11px", color: "#8c9a80", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                                        % local / total
                                    </p>
                                    <p style={{ fontSize: "22px", fontWeight: 700, color: "#3b5630", margin: "4px 0 0" }}>
                                        {metrics.ventas_totales !== "0.00"
                                            ? `${((parseFloat(metrics.ventas_actores_locales) / parseFloat(metrics.ventas_totales)) * 100).toFixed(1)}%`
                                            : "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
            </main>


            <footer
                style={{
                    background: "#3b5630",
                    color: "rgba(255,255,255,0.55)",
                    textAlign: "center",
                    padding: "16px",
                    fontSize: "12px",
                }}
            >
                © {new Date().getFullYear()} Raíz Viva · Todos los derechos reservados
            </footer>
        </div>
    );
}