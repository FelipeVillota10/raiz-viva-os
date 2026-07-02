'use client';

interface EstadisticaCardProps {
  label: string;
  value: string;
  accent?: boolean;
  sublabel?: string;
}

export function EstadisticaCard({ label, value, accent, sublabel }: EstadisticaCardProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        padding: "24px 26px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        boxShadow: "0 2px 12px rgba(59,86,48,0.07)",
        border: "1.5px solid #e8e0cc",
        borderTop: accent ? "3px solid #3b5630" : "3px solid #c8d9bf",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.18s, box-shadow 0.18s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(59,86,48,0.13)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(59,86,48,0.07)";
      }}
    >
      <p style={{
        fontSize: "11px",
        fontWeight: 600,
        color: "#8c9a80",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        margin: 0,
      }}>
        {label}
      </p>

      <p style={{
        fontSize: "30px",
        fontWeight: 700,
        color: accent ? "#3b5630" : "#2d3e28",
        lineHeight: 1.1,
        margin: 0,
        fontVariantNumeric: "tabular-nums",
      }}>
        {value}
      </p>

      {sublabel && (
        <p style={{ fontSize: "11px", color: "#a8b89e", margin: 0 }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}