export type Categoria = "sugerencia" | "bug" | "mejora" | "otro";
export type Estado = "pendiente" | "revision" | "resuelto" | "rechazado";

export interface Comentario {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: Categoria;
  prioridad: number;
  visible_para: string;
  estado: Estado;
}

export interface ComentarioPayload {
  titulo: string;
  descripcion: string;
  categoria: Categoria;
  prioridad: number;
  visible_para?: string;
  estado?: Estado;
}

export interface ComentarioPatch {
  estado?: Estado;
  prioridad?: number;
  categoria?: Categoria;
  visible_para?: string;
}

export interface FiltrosParams {
  estado?: Estado | "";
  categoria?: Categoria | "";
  prioridad?: number | "";
}

const BASE = "http://127.0.0.1:8000/api/comentarios";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(error));
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const getComentarios = async (filtros?: FiltrosParams): Promise<Comentario[]> => {
  const params = new URLSearchParams();
  if (filtros?.estado) params.set("estado", filtros.estado);
  if (filtros?.categoria) params.set("categoria", filtros.categoria);
  if (filtros?.prioridad) params.set("prioridad", String(filtros.prioridad));
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<Comentario[]>(`/${query}`);
};

export const createComentario = async (payload: ComentarioPayload): Promise<Comentario> => {
  return request<Comentario>("/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const patchComentario = async (id: number, payload: ComentarioPatch): Promise<Comentario> => {
  return request<Comentario>(`/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteComentario = async (id: number): Promise<void> => {
  return request<void>(`/${id}/`, { method: "DELETE" });
};
export interface Tendencias {
  total_comentarios: number;

  por_categoria: {
    categoria: string;
    total: number;
  }[];

  por_estado: {
    estado: string;
    total: number;
  }[];

  prioridades_altas: number;
}

export const getTendencias =
  async (): Promise<Tendencias> => {
    return request<Tendencias>(
      "/tendencias/"
    );
  };
