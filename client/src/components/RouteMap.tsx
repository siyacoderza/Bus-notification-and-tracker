import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Bus } from 'lucide-react';
import { type BusPosition } from '@shared/schema';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: -26.1076, // Sandton area
  lng: 28.0567
};

export function RouteMap({ routeId }: { routeId: number }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  const [selectedBus, setSelectedBus] = useState<BusPosition | null>(null);

  const { data: positions } = useQuery<BusPosition[]>({
    queryKey: ["/api/routes", routeId, "positions"],
    queryFn: async () => {
      const res = await fetch(`/api/routes/${routeId}/positions`);
      if (!res.ok) throw new Error("Failed to fetch positions");
      return res.json();
    },
    refetchInterval: 5000, // Update every 5s
  });

  if (!isLoaded) return (
    <div className="h-[400px] bg-muted rounded-2xl flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="mt-8 rounded-2xl overflow-hidden border border-border/60 shadow-lg">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={positions?.[0] ? { lat: parseFloat(positions[0].lat), lng: parseFloat(positions[0].lng) } : center}
        zoom={13}
        options={{
          styles: [
            {
              "featureType": "poi",
              "stylers": [{ "visibility": "off" }]
            }
          ]
        }}
      >
        {positions?.map((bus) => (
          <Marker
            key={bus.id}
            position={{ lat: parseFloat(bus.lat), lng: parseFloat(bus.lng) }}
            onClick={() => setSelectedBus(bus)}
            icon={{
              path: "M20 12c0-1.1-.9-2-2-2V7c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v3c-1.1 0-2 .9-2 2v5c0 .75.4 1.43 1 1.79V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.21c.6-.36 1-1.04 1-1.79v-5zM8 7h8v3H8V7zm3 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z",
              fillColor: "#ff9100",
              fillOpacity: 1,
              strokeWeight: 1,
              rotation: bus.bearing || 0,
              scale: 1.5,
              anchor: new google.maps.Point(12, 12)
            }}
          />
        ))}

        {selectedBus && (
          <InfoWindow
            position={{ lat: parseFloat(selectedBus.lat), lng: parseFloat(selectedBus.lng) }}
            onCloseClick={() => setSelectedBus(null)}
          >
            <div className="p-2 min-w-[150px]">
              <div className="flex items-center gap-2 mb-2">
                <Bus className="h-4 w-4 text-primary" />
                <span className="font-bold">Bus {selectedBus.busId}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Speed: {selectedBus.speed || 0} km/h
              </p>
              <p className="text-xs font-medium text-secondary mt-1">
                ETA: ~5 mins away
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
