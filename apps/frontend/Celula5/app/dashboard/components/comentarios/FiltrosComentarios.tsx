"use client";

import {
  Categoria,
  Estado,
  FiltrosParams,
} from "../../lib/comentariosApi";

interface FiltrosComentariosProps {
  filtros: FiltrosParams;

  onChange: (
    filtros: FiltrosParams
  ) => void;

  onReset: () => void;
}

const ESTADOS: {
  value: Estado | "";
  label: string;
}[] = [
  {
    value: "",
    label: "Todos los estados",
  },
  {
    value: "pendiente",
    label: "Pendiente",
  },
  {
    value: "revision",
    label: "En revisión",
  },
  {
    value: "resuelto",
    label: "Resuelto",
  },
  {
    value: "rechazado",
    label: "Rechazado",
  },
];

const CATEGORIAS: {
  value: Categoria | "";
  label: string;
}[] = [
  {
    value: "",
    label: "Todas las categorías",
  },
  {
    value: "sugerencia",
    label: "Sugerencia",
  },
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "mejora",
    label: "Mejora",
  },
  {
    value: "otro",
    label: "Otro",
  },
];

const PRIORIDADES = [
  {
    value: "",
    label: "Cualquier prioridad",
  },
  {
    value: 1,
    label: "⬇ Prioridad 1 — Baja",
  },
  {
    value: 2,
    label: "Prioridad 2",
  },
  {
    value: 3,
    label: "Prioridad 3 — Media",
  },
  {
    value: 4,
    label: "Prioridad 4",
  },
  {
    value: 5,
    label: "⬆ Prioridad 5 — Alta",
  },
];

export function FiltrosComentarios({
  filtros,
  onChange,
  onReset,
}: FiltrosComentariosProps) {
  const hasFilters =
    filtros.estado ||
    filtros.categoria ||
    filtros.prioridad;

  const selectStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "12px",
    border: "1.5px solid #d6cfc4",
    background: "#ffffff",
    padding: "12px 14px",
    fontSize: "14px",
    color: "#2d3a2e",
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer",
    boxShadow:
      "0 1px 4px rgba(0,0,0,0.04)",
  };

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        border: "1.5px solid #e8e0cc",
        boxShadow:
          "0 2px 12px rgba(59,86,48,0.08)",
        padding: "20px 24px",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "18px",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#7a8c7b",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: 0,
            }}
          >
            Filtros
          </p>

          <p
            style={{
              fontSize: "13px",
              color: "#8c9a80",
              margin: "4px 0 0",
            }}
          >
            Filtra comentarios por
            estado, categoría y
            prioridad
          </p>
        </div>

        {hasFilters && (
          <button
            onClick={onReset}
            style={{
              border: "none",
              background: "transparent",
              color: "#3b5630",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* FILTERS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
        }}
      >
        {/* ESTADO */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <label
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#7a8c7b",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Estado
          </label>

          <select
            value={filtros.estado ?? ""}
            onChange={(e) =>
              onChange({
                ...filtros,
                estado:
                  e.target
                    .value as Estado | "",
              })
            }
            style={selectStyle}
          >
            {ESTADOS.map((e) => (
              <option
                key={e.value}
                value={e.value}
              >
                {e.label}
              </option>
            ))}
          </select>
        </div>

        {/* CATEGORIA */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <label
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#7a8c7b",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Categoría
          </label>

          <select
            value={filtros.categoria ?? ""}
            onChange={(e) =>
              onChange({
                ...filtros,
                categoria:
                  e.target
                    .value as Categoria | "",
              })
            }
            style={selectStyle}
          >
            {CATEGORIAS.map((c) => (
              <option
                key={c.value}
                value={c.value}
              >
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* PRIORIDAD */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <label
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#7a8c7b",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Prioridad
          </label>

          <select
            value={filtros.prioridad ?? ""}
            onChange={(e) =>
              onChange({
                ...filtros,
                prioridad:
                  e.target.value === ""
                    ? ""
                    : Number(
                        e.target.value
                      ),
              })
            }
            style={selectStyle}
          >
            {PRIORIDADES.map((p) => (
              <option
                key={p.value}
                value={p.value}
              >
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}