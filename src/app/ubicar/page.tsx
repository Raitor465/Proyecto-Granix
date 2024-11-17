'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';
import Link from 'next/link';

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

// Importar el mapa dinámicamente para evitar errores de SSR
const MapWithNoSSR = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse" />
});

export default function LocationViewerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-34.6037, -58.3816]); // Default to Buenos Aires
  const [mapZoom, setMapZoom] = useState(13);

  const searchLocations = async (term: string) => {
    setIsLoading(true);
    setError('');

    try {
      let query = supabase
        .from('ubicacion')
        .select('*')
        .order('created_at', { ascending: false });

      if (term) {
        query = query.ilike('name', `%${term}%`);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      setLocations(data || []);
      
      if (data && data.length > 0) {
        setMapCenter([data[0].latitude, data[0].longitude]);
      }
    } catch (err) {
      setError('Error al buscar ubicaciones: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    searchLocations('');
  }, []);

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    setMapCenter([location.latitude, location.longitude]);
    setMapZoom(15);
  };

  return (
    <main className="min-h-screen">
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Ubicaciones Guardadas</h1>
          <Link 
            href="/geolocalizar" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Nueva Ubicación
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Panel de búsqueda */}
          <div className="md:col-span-1 space-y-4">
            <div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full p-2 border rounded"
              />
              <button
                onClick={() => searchLocations(searchTerm)}
                className="w-full mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                disabled={isLoading}
              >
                {isLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <div className="h-[calc(100vh-300px)] overflow-y-auto space-y-2">
              {locations.map(location => (
                <div
                  key={location.id}
                  onClick={() => handleLocationClick(location)}
                  className={`p-3 rounded cursor-pointer ${
                    selectedLocation?.id === location.id
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <h3 className="font-bold">{location.name}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(location.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mapa */}
          <div className="md:col-span-2 h-[calc(100vh-200px)]">
            <MapWithNoSSR 
              locations={locations}
              center={mapCenter}
              zoom={mapZoom}
              selectedLocation={selectedLocation}
            />
          </div>
        </div>
      </div>
    </main>
  );
}