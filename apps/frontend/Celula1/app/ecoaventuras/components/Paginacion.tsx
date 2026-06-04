"use client";

interface Props {
  paginaActual: number;
  totalPaginas: number;
  onCambiar: (pagina: number) => void;
}

export function Paginacion({ paginaActual, totalPaginas, onCambiar }: Props) {
  if (totalPaginas <= 1) return null;

  const paginas: (number | "...")[] = [];
  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || Math.abs(i - paginaActual) <= 1) {
      paginas.push(i);
    } else if (paginas[paginas.length - 1] !== "...") {
      paginas.push("...");
    }
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-8">
      <button onClick={() => onCambiar(paginaActual - 1)} disabled={paginaActual === 1}
        className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-green-50 transition">
        ← Anterior
      </button>
      {paginas.map((p, idx) =>
        p === "..." ? (
          <span key={idx} className="px-2 text-gray-400">…</span>
        ) : (
          <button key={p} onClick={() => onCambiar(p as number)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
              p === paginaActual ? "bg-[#3b5630] text-white" : "border hover:bg-green-50 text-gray-700"
            }`}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onCambiar(paginaActual + 1)} disabled={paginaActual === totalPaginas}
        className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-green-50 transition">
        Siguiente →
      </button>
    </nav>
  );
}
