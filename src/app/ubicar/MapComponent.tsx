'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corregir íconos de Leaflet
const icon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Location {
  // id: number;
  name: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

interface MapComponentProps {
  location: Location;
  center: [number, number];
  zoom: number;
}

const MapComponent = ({ location, center, zoom }: MapComponentProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Si el mapa ya existe, lo eliminamos
    if (mapRef.current) {
      mapRef.current.remove();
    }

    // Crear nuevo mapa
    const map = L.map(mapContainerRef.current).setView(center, zoom);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Agregar marcador
    const marker = L.marker([location.latitude, location.longitude], { icon }).addTo(map);

    marker.bindPopup(
      `<div>
        <h3 style="font-weight: bold; margin-bottom: 5px;">${location.name}</h3>
        <p style="font-size: 0.875rem; color: #666;">
          Guardado el: ${new Date(location.created_at).toLocaleDateString()}
        </p>
      </div>`
    ).openPopup();

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [location, center, zoom]);

  return <div ref={mapContainerRef} className="h-full w-full" />;
};

export default MapComponent;
