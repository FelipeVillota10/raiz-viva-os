"use client";

import { useEffect, useState } from "react";
import {
  Comentario,
  Estado,
  Categoria,
} from "../../lib/comentariosApi";

interface ComentarioModalProps {
  comentario: Comentario | null;

  onClose: () => void;

  onSave: (
  id: number,
  payload: {
    estado?: Estado;
    prioridad?: number;
    categoria?: Categoria;
    visible_para?: string;
  }
) => Promise<void>;

  loading: boolean;
}

const ESTADOS: {
  value: Estado;
  label: string;
}[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "revision", label: "En revisión" },
  { value: "resuelto", label: "Resuelto" },
  { value: "rechazado", label: "Rechazado" },
];

const CATEGORIAS: {
  value: Categoria;
  label: string;
}[] = [
  { value: "sugerencia", label: "Sugerencia" },
  { value: "bug", label: "Bug" },
  { value: "mejora", label: "Mejora" },
  { value: "otro", label: "Otro" },
];

const prioridadColors = [
  "",
  "#22c55e",
  "#84cc16",
  "#eab308",
  "#f97316",
  "#ef4444",
];

export function ComentarioModal({
  comentario,
  onClose,
  onSave,
  loading,
}: ComentarioModalProps) {
  const [estado, setEstado] =
    useState<Estado>("pendiente");

  const [prioridad, setPrioridad] =
    useState(3);

  const [categoria, setCategoria] =
    useState<Categoria>("sugerencia");
  
  const [visiblePara, setVisiblePara] =
  useState("admin_growth");

  useEffect(() => {
    if (comentario) {
      setEstado(comentario.estado);
      setPrioridad(comentario.prioridad);
      setCategoria(comentario.categoria);
      setVisiblePara(
      comentario.visible_para || "admin_growth"
      );
    }
  }, [comentario]);

  if (!comentario) return null;

  const selectStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "12px",
    border: "1.5px solid #d6cfc4",
    background: "#fafaf8",
    padding: "12px 14px",
    fontSize: "14px",
    color: "#2d3a2e",
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#ffffff",
          borderRadius: "18px",
          border: "1.5px solid #e8e0cc",
          boxShadow:
            "0 10px 40px rgba(0,0,0,0.18)",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
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
                fontSize: "18px",
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

          {/* CLOSE */}

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#7a8c7b",
              padding: 0,
              flexShrink: 0,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* BODY */}

        <div
          style={{
            borderTop: "1px solid #e8e0cc",
            paddingTop: "22px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
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
              value={estado}
              onChange={(e) =>
                setEstado(
                  e.target.value as Estado
                )
              }
              style={selectStyle}
            >
              {ESTADOS.map((s) => (
                <option
                  key={s.value}
                  value={s.value}
                >
                  {s.label}
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
              value={categoria}
              onChange={(e) =>
                setCategoria(
                  e.target.value as Categoria
                )
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
          {/* VISIBILIDAD */}

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
              Visible para
            </label>

            <select
              value={visiblePara}
              onChange={(e) =>
                setVisiblePara(e.target.value)
              }
              style={selectStyle}
            >
              <option value="admin_growth">
                Administrador y Growth
              </option>

              <option value="todos">
                Todos los usuarios
              </option>
            </select>
          </div>

          {/* PRIORIDAD */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
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
              Prioridad —{" "}
              <span
                style={{
                  color: "#2d3a2e",
                }}
              >
                {prioridad}/5
              </span>
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <input
                type="range"
                min={1}
                max={5}
                value={prioridad}
                onChange={(e) =>
                  setPrioridad(
                    Number(e.target.value)
                  )
                }
                style={{
                  flex: 1,
                  cursor: "pointer",
                  accentColor: "#3b5630",
                }}
              />

              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background:
                    prioridadColors[prioridad],
                  flexShrink: 0,
                }}
              />
            </div>
          </div>
        </div>

        {/* ACTIONS */}

        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              borderRadius: "12px",
              border: "1.5px solid #d6cfc4",
              background: "#ffffff",
              color: "#7a8c7b",
              padding: "12px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.2s ease",
            }}
          >
            Cancelar
          </button>

          <button
            onClick={() =>
              onSave(comentario.id, {
                estado,
                prioridad,
                categoria,
                visible_para: visiblePara,
              })
            }
            disabled={loading}
            style={{
              flex: 1,
              borderRadius: "12px",
              border: "none",
              background: loading
                ? "#7a8c7b"
                : "#3b5630",
              color: "#ffffff",
              padding: "12px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: loading
                ? "not-allowed"
                : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "0.2s ease",
            }}
          >
            {loading
              ? "Guardando..."
              : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}