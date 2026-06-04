"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { paqueteService, Paquete, AgregarExperienciaPayload, PaqueteError } from "../services/paqueteService";

interface PaqueteContextType {
  paquete: Paquete | null;
  cargando: boolean;
  agregando: boolean;
  error: string | null;
  agregar: (payload: AgregarExperienciaPayload) => Promise<{ exito: boolean; mensaje?: string }>;
  eliminarItem: (itemId: number) => Promise<void>;
  vaciar: () => Promise<void>;
  recargar: () => Promise<void>;
  abrirCarrito: () => void;
  cerrarCarrito: () => void;
  carritoAbierto: boolean;
}

const PaqueteContext = createContext<PaqueteContextType | null>(null);

export function PaqueteProvider({ children }: { children: React.ReactNode }) {
  const [paquete, setPaquete] = useState<Paquete | null>(null);
  const [cargando, setCargando] = useState(false);
  const [agregando, setAgregando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  const recargar = useCallback(async () => {
    try {
      setCargando(true);
      const data = await paqueteService.obtener();
      setPaquete(data);
    } catch {
      setError("No se pudo cargar el paquete.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const agregar = useCallback(async (payload: AgregarExperienciaPayload) => {
    setAgregando(true);
    setError(null);
    try {
      const data = await paqueteService.agregar(payload);
      setPaquete(data);
      setCarritoAbierto(true);
      return { exito: true };
    } catch (err) {
      const e = err as PaqueteError;
      const mensaje = e?.error || "No se pudo agregar la experiencia.";
      if (e?.code !== "DUPLICATE") setError(mensaje);
      return { exito: false, mensaje };
    } finally {
      setAgregando(false);
    }
  }, []);

  const eliminarItem = useCallback(async (itemId: number) => {
    try {
      const data = await paqueteService.eliminarItem(itemId);
      setPaquete(data);
    } catch {
      setError("No se pudo eliminar el item.");
    }
  }, []);

  const vaciar = useCallback(async () => {
    try {
      await paqueteService.vaciar();
      setPaquete((prev) => prev ? { ...prev, items: [], total: 0, num_items: 0 } : null);
    } catch {
      setError("No se pudo vaciar el paquete.");
    }
  }, []);

  return (
    <PaqueteContext.Provider
      value={{
        paquete,
        cargando,
        agregando,
        error,
        agregar,
        eliminarItem,
        vaciar,
        recargar,
        abrirCarrito: () => setCarritoAbierto(true),
        cerrarCarrito: () => setCarritoAbierto(false),
        carritoAbierto,
      }}
    >
      {children}
    </PaqueteContext.Provider>
  );
}

export function usePaquete() {
  const ctx = useContext(PaqueteContext);
  if (!ctx) throw new Error("usePaquete debe usarse dentro de PaqueteProvider");
  return ctx;
}