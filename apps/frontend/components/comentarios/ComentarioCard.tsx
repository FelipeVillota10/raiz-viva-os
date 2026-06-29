"use client";

import { Comentario } from "../../services/comentariosApi";

interface ComentarioCardProps {
  comentario: Comentario;
  onEdit?: (comentario: Comentario) => void;
  onDelete?: (id: number) => void;
  deleting?: boolean;
}

type EstiloEstado = {
  background: string;
  color: string;
  border: string;
};

const estadoStyles: Record<string, EstiloEstado> = {
  pendiente: {
    background: "#fef3c7",
    color: "#b45309",
    border: "#fcd34d",
  },
  revision: {
    background: "#dbeafe",
    color: "#1d4ed8",
    border: "#93c5fd",
  },
  resuelto: {
    background: "#d1fae5",
    color: "#047857",
    border: "#6ee7b7",
  },
  rechazado: {
    background: "#fee2e2",
    color: "#b91c1c",
    border: "#fca5a5",
  },
};
const estadoLabel: Record<string, string> = {
  pendiente: "Pendiente",
  revision: "En revisión",
  resuelto: "Resuelto",
  rechazado: "Rechazado",
};
const categoriaStyles: Record<string, EstiloEstado> = {
  sugerencia: {
    background: "#f3e8ff",
    color: "#7c3aed",
    border: "#d8b4fe",
  },
  bug: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "#fca5a5",
  },
  mejora: {
    background: "#e0f2fe",
    color: "#0369a1",
    border: "#7dd3fc",
  },
  otro: {
    background: "#f3f4f6",
    color: "#4b5563",
    border: "#d1d5db",
  },
};
const prioridadColors = [
  "",
  "#22c55e",
  "#84cc16",
  "#eab308",
  "#f97316",
  "#ef4444",
];

const prioridadLabel = [
  "",
  "Baja",
  "Media-baja",
  "Media",
  "Media-alta",
  "Alta",
];

export function ComentarioCard({
  comentario,
  onEdit,
  onDelete,
  deleting,
}: ComentarioCardProps) {
  const estado =
    estadoStyles[comentario.estado] ?? estadoStyles.pendiente;

  const categoria =
    categoriaStyles[comentario.categoria] ??
    categoriaStyles.otro;

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        border: "1.5px solid #e8e0cc",
        boxShadow: "0 2px 12px rgba(59,86,48,0.08)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        transition: "all 0.2s ease",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "14px",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#2d3a2e",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {comentario.titulo}
          </h3>

          <p
            style={{
              fontSize: "13px",
              color: "#7a8c7b",
              margin: "8px 0 0",
              lineHeight: 1.6,
            }}
          >
            {comentario.descripcion}
          </p>
        </div>

        {/* PRIORIDAD */}

        <div
          title={`Prioridad ${prioridadLabel[comentario.prioridad]}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background:
                prioridadColors[comentario.prioridad],
            }}
          />

          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#2d3a2e",
            }}
          >
            {comentario.prioridad}
          </span>
        </div>
      </div>

      {/* BADGES */}

      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            padding: "6px 10px",
            borderRadius: "999px",
            background: estado.background,
            color: estado.color,
            border: `1px solid ${estado.border}`,
          }}
        >
          {estadoLabel[comentario.estado] ??
            comentario.estado}
        </span>

        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            padding: "6px 10px",
            borderRadius: "999px",
            background: categoria.background,
            color: categoria.color,
            border: `1px solid ${categoria.border}`,
          }}
        >
          {comentario.categoria}
        </span>
      </div>

      {/* ACTIONS — solo si se pasan onEdit u onDelete */}

      {(onEdit || onDelete) && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            paddingTop: "10px",
            borderTop: "1px solid #f0ebe3",
          }}
        >
          {onEdit && (
            <button
              onClick={() => onEdit(comentario)}
              style={{
                flex: 1,
                border: "none",
                background: "#f0f7f0",
                color: "#3b5630",
                borderRadius: "10px",
                padding: "10px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "0.2s ease",
              }}
            >
              Editar
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(comentario.id)}
              disabled={deleting}
              style={{
                flex: 1,
                border: "none",
                background: "#fef2f2",
                color: "#dc2626",
                borderRadius: "10px",
                padding: "10px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: deleting ? "not-allowed" : "pointer",
                opacity: deleting ? 0.6 : 1,
                transition: "0.2s ease",
              }}
            >
              {deleting ? "Deshabilitando..." : "Deshabilitar"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}