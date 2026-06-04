"use client";

import { useEffect, useState } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { API_URL } from "../services/api";

type Cliente = {
  id_cliente: number;
  nombre: string;
  usuario_nombre: string;
  telefono: string | null;
  es_actor: boolean;
  es_lider: boolean;
  es_turista: boolean;
  es_admin: boolean;
  territorio_nombre: string | null;
  tipos_actores: { id: number; nombre_tipo: string }[];
  foto_perfil_url: string | null;
  foto_portada_url: string | null;
  descripcion: string | null;
  activo: boolean;
  direccion: string | null;
  lat?: number;
  lng?: number;
};

const containerStyle = {
  width: "100%",
  height: "80vh",
};

const center = {
  lat: 3.5386,
  lng: -76.3036,
};

async function getCoordinates(address: string): Promise<{ lat: number; lng: number } | null> {
  const key = process.env.NEXT_PUBLIC_GEOCODING_KEY || "";
  if (!key) {
    console.error("NEXT_PUBLIC_GEOCODING_KEY no está configurada");
    return null;
  }
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`
    );
    if (!res.ok) {
      console.warn(`Geocoding HTTP ${res.status} para "${address}"`);
      return null;
    }
    const data = await res.json();
    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].geometry.location;
    }
    console.warn(`Geocoding status=${data.status} para "${address}": ${data.error_message || ""}`);
    return null;
  } catch (err) {
    console.error("Error en geocoding:", err);
    return null;
  }
}

export default function MapaEconomico() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selected, setSelected] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch(`${API_URL}/api/clientes/`);
        const data: Cliente[] = await res.json();

        const actores = data.filter(
          (c) => c.es_actor && c.direccion && c.direccion.trim().length > 0
        );

        const results = await Promise.allSettled(
          actores.map(async (c) => {
            const coords = await getCoordinates(c.direccion!);
            return coords ? { ...c, lat: coords.lat, lng: coords.lng } : c;
          })
        );

        const geocoded = results
          .filter((r) => r.status === "fulfilled")
          .map((r) => (r as PromiseFulfilledResult<Cliente>).value);

        setClientes(geocoded);
      } catch (err) {
        console.error("Error cargando clientes:", err);
      } finally {
        setLoading(false);
      }
    }

    loadClients();
  }, []);

  if (!isLoaded) return <p>Cargando mapa...</p>;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        {loading ? (
          <p style={{ padding: "1rem" }}>Cargando actores territoriales...</p>
        ) : clientes.length === 0 ? (
          <p style={{ padding: "1rem" }}>
            No hay actores territoriales con dirección para mostrar.
          </p>
        ) : (
          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
            {clientes.map((c) =>
              c.lat && c.lng ? (
                <Marker
                  key={c.id_cliente}
                  position={{ lat: c.lat, lng: c.lng }}
                  onClick={() => setSelected(c)}
                />
              ) : null
            )}

            {selected && selected.lat && selected.lng && (
              <InfoWindow
                position={{ lat: selected.lat, lng: selected.lng }}
                onCloseClick={() => setSelected(null)}
              >
                <div style={{ maxWidth: "220px" }}>
                  <h3>{selected.nombre}</h3>
                  <p><b>Email:</b> {selected.usuario_nombre}</p>
                  <p><b>Dirección:</b> {selected.direccion}</p>
                  <p>
                    <b>Roles:</b>{" "}
                    {selected.tipos_actores.map((t) => t.nombre_tipo).join(", ") ||
                      "Sin rol"}
                  </p>
                  {selected.foto_perfil_url && (
                    <img src={selected.foto_perfil_url} alt="Perfil" width="80" />
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </main>

      <Footer />
    </div>
  );
}
