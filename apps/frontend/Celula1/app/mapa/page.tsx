"use client";

import { useEffect, useState } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

type Cliente = {
  id: number;
  full_name: string;
  direccion: string;
  productor: boolean;
  caminante: boolean;
  custodio: boolean;
  facilitador: boolean;
  anfitrion: boolean;
  profile_photo: string | null;
  cover_photo: string | null;
  aprobado: boolean;
  observaciones: string | null;
  lat?: number;
  lng?: number;
};

const containerStyle = {
  width: "100%",
  height: "80vh",
};

const center = {
  lat: 3.5386, // Coordenadas aproximadas de Palmira
  lng: -76.3036,
};

export default function MapaEconomico() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selected, setSelected] = useState<Cliente | null>(null);

  // 🔹 Función para convertir dirección en coordenadas
  async function getCoordinates(address: string) {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`
    );
    const data = await res.json();
    if (data.results.length > 0) {
      return data.results[0].geometry.location; // { lat, lng }
    }
    return null;
  }

  useEffect(() => {
    async function loadClients() {
      const res = await fetch("http://localhost:8000/api/clientes/");
      const data: Cliente[] = await res.json();

      // 🔹 Geocodificar cada dirección
      const clientsWithCoords = await Promise.all(
        data.map(async (cliente) => {
          if (cliente.direccion) {
            const coords = await getCoordinates(cliente.direccion);
            if (coords) {
              return { ...cliente, lat: coords.lat, lng: coords.lng };
            }
          }
          return cliente;
        })
      );

      setClientes(clientsWithCoords);
    }

    loadClients();
  }, []);

  if (!isLoaded) return <p>Cargando mapa...</p>;

  return (
    <div className="flex flex-col min-h-screen">
      {/* 🔹 Header principal con botón Volver automático en /mapa */}
      <Header />

      <main className="flex-grow">
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
          {clientes.map((cliente) =>
            cliente.lat && cliente.lng ? (
              <Marker
                key={cliente.id}
                position={{ lat: cliente.lat, lng: cliente.lng }}
                onClick={() => setSelected(cliente)}
              />
            ) : null
          )}

          {selected && (
            <InfoWindow
              position={{ lat: selected.lat!, lng: selected.lng! }}
              onCloseClick={() => setSelected(null)}
            >
              <div style={{ maxWidth: "200px" }}>
                <h3>{selected.full_name}</h3>
                <p><b>Dirección:</b> {selected.direccion}</p>
                <p><b>Roles:</b></p>
                <ul>
                  {selected.productor && <li>Productor</li>}
                  {selected.caminante && <li>Caminante</li>}
                  {selected.custodio && <li>Custodio</li>}
                  {selected.facilitador && <li>Facilitador</li>}
                  {selected.anfitrion && <li>Anfitrión</li>}
                </ul>
                {selected.profile_photo && (
                  <img src={selected.profile_photo} alt="Perfil" width="80" />
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </main>

      <Footer />
    </div>
  );
}




