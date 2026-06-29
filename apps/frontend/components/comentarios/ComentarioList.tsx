"use client";

import { Comentario } from "../../services/comentariosApi";
import { ComentarioCard } from "./ComentarioCard";

interface ComentarioListProps {
  comentarios: Comentario[];
  loading: boolean;
  error: string | null;
  onEdit?: (comentario: Comentario) => void;
  onDelete?: (id: number) => void;
  deletingId?: number | null;
}

export function ComentarioList({
  comentarios,
  loading,
  error,
  onEdit,
  onDelete,
  deletingId,
}: ComentarioListProps) {
  // ───────────────── LOADING ─────────────────

  if (loading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              border: "1.5px solid #e8e0cc",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              boxShadow:
                "0 2px 12px rgba(59,86,48,0.08)",
            }}
          >
            <div
              style={{
                height: "16px",
                width: "70%",
                background: "#e8e0cc",
                borderRadius: "8px",
              }}
            />

            <div
              style={{
                height: "12px",
                width: "100%",
                background: "#f0ebe3",
                borderRadius: "8px",
              }}
            />

            <div
              style={{
                height: "12px",
                width: "65%",
                background: "#f0ebe3",
                borderRadius: "8px",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "6px",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "24px",
                  borderRadius: "999px",
                  background: "#e8e0cc",
                }}
              />

              <div
                style={{
                  width: "60px",
                  height: "24px",
                  borderRadius: "999px",
                  background: "#e8e0cc",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ───────────────── ERROR ─────────────────

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "18px",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#dc2626"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <p
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#dc2626",
            margin: 0,
          }}
        >
          {error}
        </p>

        <p
          style={{
            fontSize: "12px",
            color: "#7a8c7b",
            marginTop: "8px",
          }}
        >
          Verifica que el backend esté ejecutándose
        </p>
      </div>
    );
  }

  // ───────────────── EMPTY ─────────────────

  if (comentarios.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "#f0f7f0",
            border: "1px solid #c5d9c6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "18px",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3b5630"
            strokeWidth="1.8"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        <p
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#2d3a2e",
            margin: 0,
          }}
        >
          Sin comentarios
        </p>

        <p
          style={{
            fontSize: "12px",
            color: "#7a8c7b",
            marginTop: "8px",
          }}
        >
          No existen comentarios con los filtros actuales
        </p>
      </div>
    );
  }

  // ───────────────── LIST ─────────────────

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "18px",
      }}
    >
      {comentarios.map((c) => (
        <ComentarioCard
          key={c.id}
          comentario={c}
          onEdit={onEdit}
          onDelete={onDelete}
          deleting={deletingId === c.id}
        />
      ))}
    </div>
  );
}