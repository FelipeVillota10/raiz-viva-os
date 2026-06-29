"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Comentario,
  ComentarioPayload,
  getComentarios,
  createComentario,
} from "@/services/comentariosApi";
import { ComentarioForm } from "@/components/comentarios/ComentarioForm";
import { ComentarioList } from "@/components/comentarios/ComentarioList";
import { AppHeader } from "@/components/shared/AppHeader";
import { Footer } from "@/components/shared/Footer";

// ─────────────────────────────────────────────────────────────
// Toasts
// ─────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

let toastCounter = 0;

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = ++toastCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  return { toasts, add };
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default function ComentariosTuristaPage() {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toasts, add: addToast } = useToasts();

  // ───────────────── Fetch ─────────────────

  const fetchComentarios = useCallback(async () => {
    setLoadingList(true);
    setErrorList(null);
    try {
      const data = await getComentarios({});
      setComentarios(data);
    } catch {
      setErrorList(
        "No se pudieron cargar los comentarios. Verifica la conexión al backend."
      );
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchComentarios();
  }, [fetchComentarios]);

  // ───────────────── Handlers ─────────────────

  const handleCreate = async (payload: ComentarioPayload) => {
    setLoadingForm(true);
    try {
      await createComentario(payload);
      addToast("Comentario enviado correctamente", "success");
      setShowForm(false);
      await fetchComentarios();
    } catch {
      addToast("Error al enviar el comentario", "error");
    } finally {
      setLoadingForm(false);
    }
  };

  // ───────────────── Render ─────────────────

  return (
    
    <div
      style={{
        minHeight: "100vh",
        background: "#f9f3e7",
        display: "flex",
        flexDirection: "column",
      }}
    >
    <AppHeader role="public" />
      {/* TOASTS */}

      <div
        style={{
          position: "fixed",
          top: "16px",
          right: "16px",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: "#ffffff",
              border:
                t.type === "success"
                  ? "1px solid #bbf7d0"
                  : "1px solid #fecaca",
              color:
                t.type === "success"
                  ? "#166534"
                  : "#b91c1c",
              padding: "12px 16px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* MAIN */}

      <main
        style={{
          flex: 1,
          padding: "36px 40px",
          maxWidth: "1300px",
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxSizing: "border-box",
        }}
      >
        {/* TITULO */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
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
              Comentarios y sugerencias
            </h1>

            <p
              style={{
                fontSize: "13px",
                color: "#8c9a80",
                margin: "4px 0 0",
              }}
            >
              Comparte tu experiencia o reporta un problema
            </p>
          </div>

          <button
            onClick={() => setShowForm((v) => !v)}
            style={{
              background: showForm ? "#8c9a80" : "#3b5630",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "12px 18px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 8px rgba(59,86,48,0.18)",
              transition: "background 0.2s ease",
            }}
          >
            {showForm ? "Cancelar" : "Nuevo comentario"}
          </button>
        </div>

        {/* FORM */}

        {showForm && (
          <ComentarioForm
            onSubmit={handleCreate}
            loading={loadingForm}
          />
        )}

        {/* CONTADOR */}

        {!loadingList && !errorList && (
          <p
            style={{
              fontSize: "12px",
              color: "#8c9a80",
              margin: 0,
            }}
          >
            {comentarios.length === 0
              ? "Sin comentarios aún"
              : `${comentarios.length} comentario${comentarios.length !== 1 ? "s" : ""} de la comunidad`}
          </p>
        )}

        {/* LISTA — sin onEdit ni onDelete, la card no muestra botones */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1.5px solid #e8e0cc",
            padding: "20px",
            boxShadow: "0 2px 12px rgba(59,86,48,0.08)",
          }}
        >
          <ComentarioList
            comentarios={comentarios}
            loading={loadingList}
            error={errorList}
          />
          
        </div>
        
      </main>
      <Footer />
    </div>
  );
}