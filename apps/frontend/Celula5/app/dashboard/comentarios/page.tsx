"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Comentario,
  ComentarioPayload,
  ComentarioPatch,
  FiltrosParams,
  getComentarios,
  createComentario,
  patchComentario,
  deleteComentario,
} from "../lib/comentariosApi";

import { ComentarioForm } from "../components/comentarios/ComentarioForm";
import { ComentarioList } from "../components/comentarios/ComentarioList";
import { FiltrosComentarios } from "../components/comentarios/FiltrosComentarios";
import { ComentarioModal } from "../components/comentarios/ComentarioModal";
import {getTendencias,Tendencias,} from "../lib/comentariosApi";

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

export default function ComentariosPage() {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [filtros, setFiltros] = useState<FiltrosParams>({});
  const [loadingList, setLoadingList] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Comentario | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tendencias, setTendencias] = useState<Tendencias | null>(null);
  console.log("TENDENCIAS:", tendencias);
  const { toasts, add: addToast } = useToasts();

  // ───────────────── Fetch ─────────────────
  const fetchTendencias = useCallback(
    async () => {
      try {
        const data =
          await getTendencias();

        setTendencias(data);
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  const fetchComentarios = useCallback(async () => {
    setLoadingList(true);
    setErrorList(null);

    try {
      const data = await getComentarios(filtros);
      setComentarios(data);
    } catch {
      setErrorList(
        "No se pudieron cargar los comentarios. Verifica la conexión al backend."
      );
    } finally {
      setLoadingList(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchComentarios();
    fetchTendencias();
  }, [fetchComentarios,
      fetchTendencias,]);

  // ───────────────── Handlers ─────────────────

  const handleCreate = async (payload: ComentarioPayload) => {
  setLoadingForm(true);

  try {
    await createComentario(payload);

    addToast("Comentario creado correctamente", "success");

    setShowForm(false);

    await fetchComentarios();
    await fetchTendencias();
  } catch {
    addToast("Error al crear el comentario", "error");
  } finally {
    setLoadingForm(false);
  }
};

  const handlePatch = async (
  id: number,
  payload: ComentarioPatch
) => {
  setLoadingModal(true);

  try {
    await patchComentario(id, payload);

    addToast("Comentario actualizado", "success");

    setEditTarget(null);

    await fetchComentarios();
    await fetchTendencias();
  } catch {
    addToast("Error al actualizar el comentario", "error");
  } finally {
    setLoadingModal(false);
  }
};
  const handleDelete = async (id: number) => {
    setDeletingId(id);

    try {
      await deleteComentario(id);

      addToast("Comentario eliminado", "success");

      await fetchComentarios();
      await fetchTendencias();
    } catch {
      addToast("Error al eliminar el comentario", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // ───────────────── Stats ─────────────────

  const estadoMeta: {
    key: "pendiente" | "revision" | "resuelto" | "rechazado";
    label: string;
    color: string;
  }[] = [
      { key: "pendiente", label: "Pendiente", color: "#d97706" },
      { key: "revision", label: "En revisión", color: "#2563eb" },
      { key: "resuelto", label: "Resuelto", color: "#059669" },
      { key: "rechazado", label: "Rechazado", color: "#dc2626" },
    ];

  const counts = comentarios.reduce<Record<string, number>>((acc, c) => {
    acc[c.estado] = (acc[c.estado] ?? 0) + 1;
    return acc;
  }, {});

  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  

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
      {/* HEADER */}

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "180px",
              height: "180px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <img
              src="/logo.png"
              alt="Raíz Viva"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>

          <div>
            <p
              style={{
                fontSize: "18px",
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.1,
                color: "#ffffff",
              }}
            >
              Raíz Viva
            </p>

            <p
              style={{
                fontSize: "11px",
                opacity: 0.65,
                margin: 0,
                letterSpacing: "0.04em",
              }}
            >
              Gestión de comentarios
            </p>
          </div>
        </div>

        <p
          style={{
            fontSize: "12px",
            opacity: 0.65,
            margin: 0,
            textTransform: "capitalize",
          }}
        >
          {today}
        </p>
      </header>

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

      {/* MODAL */}

      <ComentarioModal
        comentario={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handlePatch}
        loading={loadingModal}
      />

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
              Comentarios
            </h1>

            <p
              style={{
                fontSize: "13px",
                color: "#8c9a80",
                margin: "4px 0 0",
              }}
            >
              Gestiona comentarios y sugerencias de la plataforma
            </p>
          </div>

          <button
            onClick={() => setShowForm((v) => !v)}
            style={{
              background: "#3b5630",
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
            }}
          >
            {showForm ? "Cerrar formulario" : "Nuevo comentario"}
          </button>
        </div>

        {/* STATS */}

        {!loadingList && comentarios.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
            }}
          >
            {estadoMeta.map(({ key, label, color }) => (
              <div
                key={key}
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  border: "1.5px solid #e8e0cc",
                  padding: "18px",
                  textAlign: "center",
                  boxShadow:
                    "0 2px 12px rgba(59,86,48,0.08)",
                }}
              >
                <p
                  style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    color,
                    margin: 0,
                  }}
                >
                  {counts[key] ?? 0}
                </p>

                <p
                  style={{
                    fontSize: "11px",
                    color: "#8c9a80",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginTop: "6px",
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}
        {tendencias && (
  <div
    style={{
      background: "#ffffff",
      borderRadius: "14px",
      padding: "20px 24px",
      border: "1.5px solid #e8e0cc",
      boxShadow:
        "0 2px 12px rgba(59,86,48,0.08)",
    }}
  >
    <h2
      style={{
        fontSize: "14px",
        fontWeight: 600,
        color: "#557149",
        margin: "0 0 16px",
      }}
    >
      Tendencias de Feedback
    </h2>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(180px,1fr))",
        gap: "16px",
      }}
    >
      <div>
        <p
          style={{
            fontSize: "11px",
            color: "#8c9a80",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Total comentarios
        </p>

        <p
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#3b5630",
            margin: "6px 0 0",
          }}
        >
          {tendencias.total_comentarios}
        </p>
      </div>

      <div>
        <p
          style={{
            fontSize: "11px",
            color: "#8c9a80",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Prioridad alta
        </p>

        <p
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#ef4444",
            margin: "6px 0 0",
          }}
        >
          {tendencias.prioridades_altas}
        </p>
      </div>
    </div>

    <div
      style={{
        marginTop: "24px",
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(280px,1fr))",
        gap: "20px",
      }}
    >
      <div>
        <h3
          style={{
            fontSize: "13px",
            color: "#557149",
            marginBottom: "12px",
          }}
        >
          Categorías más reportadas
        </h3>

        {tendencias.por_categoria.map(
          (item) => (
            <div
              key={item.categoria}
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginBottom: "8px",
              }}
            >
              <span>{item.categoria}</span>

              <strong>
                {item.total}
              </strong>
            </div>
          )
        )}
      </div>

      <div>
        <h3
          style={{
            fontSize: "13px",
            color: "#557149",
            marginBottom: "12px",
          }}
        >
          Estados actuales
        </h3>

        {tendencias.por_estado.map(
          (item) => (
            <div
              key={item.estado}
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginBottom: "8px",
              }}
            >
              <span>{item.estado}</span>

              <strong>
                {item.total}
              </strong>
            </div>
          )
        )}
      </div>
    </div>
  </div>
)}

        {/* FORM */}

        {showForm && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              border: "1.5px solid #e8e0cc",
              padding: "24px",
              boxShadow: "0 2px 12px rgba(59,86,48,0.08)",
            }}
          >
            <ComentarioForm
              onSubmit={handleCreate}
              loading={loadingForm}
            />
          </div>
        )}

        {/* FILTROS */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1.5px solid #e8e0cc",
            padding: "20px",
            boxShadow: "0 2px 12px rgba(59,86,48,0.08)",
          }}
        >
          <FiltrosComentarios
            filtros={filtros}
            onChange={setFiltros}
            onReset={() => setFiltros({})}
          />
        </div>

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
              ? "Sin resultados"
              : `${comentarios.length} comentario${comentarios.length !== 1 ? "s" : ""
              }`}
          </p>
        )}

        {/* LISTA */}

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
            onEdit={setEditTarget}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        </div>
      </main>

      {/* FOOTER */}

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