"use client";

import { useState } from "react";
import {
  Categoria,
  ComentarioPayload,
} from "../../services/comentariosApi";

interface ComentarioFormProps {
  onSubmit: (payload: ComentarioPayload) => Promise<void>;
  loading: boolean;
}

const CATEGORIAS: {
  value: Categoria;
  label: string;
  background: string;
  color: string;
  border: string;
}[] = [
  {
    value: "sugerencia",
    label: "Sugerencia",
    background: "#f3e8ff",
    color: "#7c3aed",
    border: "#d8b4fe",
  },
  {
    value: "bug",
    label: "Bug",
    background: "#fee2e2",
    color: "#dc2626",
    border: "#fca5a5",
  },
  {
    value: "mejora",
    label: "Mejora",
    background: "#dbeafe",
    color: "#2563eb",
    border: "#93c5fd",
  },
  {
    value: "otro",
    label: "Otro",
    background: "#f3f4f6",
    color: "#4b5563",
    border: "#d1d5db",
  },
];

const prioridadColors = [
  "",
  "#22c55e",
  "#84cc16",
  "#eab308",
  "#f97316",
  "#ef4444",
];

export function ComentarioForm({
  onSubmit,
  loading,
}: ComentarioFormProps) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] =
    useState<Categoria>("sugerencia");
  const [prioridad, setPrioridad] = useState(3);

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const validate = () => {
    const e: Record<string, string> = {};

    if (!titulo.trim()) {
      e.titulo = "El título es obligatorio";
    }

    if (!descripcion.trim()) {
      e.descripcion = "La descripción es obligatoria";
    }

    if (prioridad < 1 || prioridad > 5) {
      e.prioridad =
        "La prioridad debe estar entre 1 y 5";
    }

    return e;
  };

  const handleSubmit = async () => {
    const e = validate();

    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setErrors({});

    await onSubmit({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      categoria,
      prioridad,
      estado: "pendiente",
    });

    setTitulo("");
    setDescripcion("");
    setCategoria("sugerencia");
    setPrioridad(3);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "12px",
    border: "1.5px solid #d6cfc4",
    background: "#fafaf8",
    padding: "12px 14px",
    fontSize: "14px",
    color: "#2d3a2e",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        border: "1.5px solid #e8e0cc",
        boxShadow: "0 2px 12px rgba(59,86,48,0.08)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* TITLE */}

      <div>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#2d3a2e",
            margin: 0,
          }}
        >
          Nuevo comentario
        </h2>

        <p
          style={{
            fontSize: "13px",
            color: "#8c9a80",
            margin: "6px 0 0",
          }}
        >
          Registra sugerencias, errores o mejoras
        </p>
      </div>

      {/* TITULO */}

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
          Título
        </label>

        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ej: Error al iniciar sesión"
          maxLength={120}
          style={inputStyle}
        />

        {errors.titulo && (
          <p
            style={{
              fontSize: "12px",
              color: "#dc2626",
              margin: 0,
            }}
          >
            {errors.titulo}
          </p>
        )}
      </div>

      {/* DESCRIPCION */}

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
          Descripción
        </label>

        <textarea
          value={descripcion}
          onChange={(e) =>
            setDescripcion(e.target.value)
          }
          placeholder="Describe el detalle del comentario..."
          rows={4}
          style={{
            ...inputStyle,
            resize: "none",
            fontFamily: "inherit",
          }}
        />

        {errors.descripcion && (
          <p
            style={{
              fontSize: "12px",
              color: "#dc2626",
              margin: 0,
            }}
          >
            {errors.descripcion}
          </p>
        )}
      </div>

      {/* GRID */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        {/* CATEGORIAS */}

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
            Categoría
          </label>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {CATEGORIAS.map((c) => {
              const selected =
                categoria === c.value;

              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() =>
                    setCategoria(c.value)
                  }
                  style={{
                    borderRadius: "10px",
                    border: selected
                      ? `1.5px solid ${c.border}`
                      : "1.5px solid #d6cfc4",
                    background: selected
                      ? c.background
                      : "#ffffff",
                    color: selected
                      ? c.color
                      : "#7a8c7b",
                    padding: "8px 14px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "0.2s ease",
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
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

          {errors.prioridad && (
            <p
              style={{
                fontSize: "12px",
                color: "#dc2626",
                margin: 0,
              }}
            >
              {errors.prioridad}
            </p>
          )}
        </div>
      </div>

      {/* BUTTON */}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          borderRadius: "12px",
          border: "none",
          background: loading
            ? "#7a8c7b"
            : "#3b5630",
          color: "#ffffff",
          padding: "14px",
          fontSize: "14px",
          fontWeight: 700,
          cursor: loading
            ? "not-allowed"
            : "pointer",
          transition: "0.2s ease",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading
          ? "Enviando..."
          : "Enviar comentario"}
      </button>
    </div>
  );
}