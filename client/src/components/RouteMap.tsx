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
  lat: -26.1076,
  lng: 28.0567
};

export function RouteMap({ routeId }: { routeId: number }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  const [selectedBus, setSelectedBus] = useState<BusPosition | null>(null);

  const { data: positions, error: positionsError } = useQuery<BusPosition[]>({
    queryKey: ["/api/routes", routeId, "positions"],
    queryFn: async () => {
      const res = await fetch(`/api/routes/${routeId}/positions`);
      if (!res.ok) throw new Error("Failed to fetch positions");
      return res.json();
    },
    refetchInterval: 5000,
  });

  if (loadError) return (
    <div className="h-[400px] bg-destructive/10 rounded-2xl flex items-center justify-center p-4 text-center">
      <p className="text-destructive font-medium">Map load error. Please check API key configuration.</p>
    </div>
  );

  if (!isLoaded) return (
    <div className="h-[400px] bg-muted rounded-2xl flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const mapCenter = positions?.[0] 
    ? { lat: parseFloat(positions[0].lat), lng: parseFloat(positions[0].lng) } 
    : center;

  return (
    <div className="mt-8 rounded-2xl overflow-hidden border border-border/60 shadow-lg relative group">
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-border/50 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider text-foreground/70">Live Tracking</span>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={13}
        options={{
          disableDefaultUI: false,
          clickableIcons: false,
          styles: [
            {
              "featureType": "poi",
              "stylers": [{ "visibility": "off" }]
            },
            {
              "featureType": "transit",
              "elementType": "labels.icon",
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
            title={`Bus ${bus.busId}`}
            icon={{
              path: "M20 12c0-1.1-.9-2-2-2V7c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v3c-1.1 0-2 .9-2 2v5c0 .75.4 1.43 1 1.79V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.21c.6-.36 1-1.04 1-1.79v-5zM8 7h8v3H8V7zm3 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z",
              fillColor: "#ff9100",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
              rotation: bus.bearing || 0,
              scale: 1.8,
              anchor: new google.maps.Point(12, 12)
            }}
          />
        ))}

        {selectedBus && (
          <InfoWindow
            position={{ lat: parseFloat(selectedBus.lat), lng: parseFloat(selectedBus.lng) }}
            onCloseClick={() => setSelectedBus(null)}
          >
            <div className="p-3 min-w-[180px] bg-white">
              <div className="flex items-center justify-between mb-3 border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1.5 rounded-lg">
                    <Bus className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-bold text-sm">Bus {selectedBus.busId}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Speed</span>
                  <span className="font-semibold">{selectedBus.speed || 0} km/h</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">ETA</span>
                  <span className="font-bold text-secondary">~5 mins away</span>
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
