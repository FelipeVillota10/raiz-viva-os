/**
 * Página de mapa económico (View)
 * @celula - Celula1
 * Vista que utiliza useMapa como ViewModel.
 */

"use client";

import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { AppHeader } from "@/components/shared/AppHeader";
import { Footer } from "@/components/shared/Footer";
import { useMapa } from "@/hooks/useMapa";
import { ActorInfoWindow } from "@/components/ui/mapa/ActorInfoWindow";
import { MapaEmptyState } from "@/components/ui/mapa/MapaEmptyState";
import { LoadingState } from "@/components/ui/base/LoadingState";

const containerStyle = {
  width: "100%",
  height: "80vh",
};

const center = {
  lat: 3.5386,
  lng: -76.3036,
};

export default function MapaEconomico() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

  const { clientes, selected, loading, setSelected } = useMapa();

  if (!isLoaded) return <LoadingState message="Cargando mapa..." />;

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader role="public" />

      <main className="flex-grow">
        {loading ? (
          <LoadingState message="Cargando actores territoriales..." />
        ) : clientes.length === 0 ? (
          <MapaEmptyState />
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
                <ActorInfoWindow actor={selected} />
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </main>

      <Footer />
    </div>
  );
}
