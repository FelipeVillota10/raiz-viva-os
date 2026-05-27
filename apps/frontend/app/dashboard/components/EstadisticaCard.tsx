'use client';


interface EstadisticaCardProps {
  label: string;
  value: string;
  icon: string;
  accent?: boolean;
  sublabel?: string;
}

export function EstadisticaCard({ label, value, icon, accent, sublabel }: EstadisticaCardProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        padding: "20px 22px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        boxShadow: "0 2px 12px rgba(59,86,48,0.10)",
        border: "1.5px solid #e8e0cc",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.18s",
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
    >

      <span
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "4px",
          height: "100%",
          background: accent ? "#0cc0df" : "#8c9a80",
          borderRadius: "14px 0 0 14px",
        }}
      />


      <div
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "13px",
          background: accent ? "#d0f5fb" : "#f9f3e7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>


      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#8c9a80",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: 0,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: "26px",
            fontWeight: 700,
            color: "#3b5630",
            lineHeight: 1.1,
            margin: "2px 0 0",
          }}
        >
          {value}
        </p>
        {sublabel && (
          <p style={{ fontSize: "11px", color: "#8c9a80", margin: "3px 0 0" }}>
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}