'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export default function GeolocalizarPage() {
  const [location, setLocation] = useState<LocationData>({
    name: '',
    latitude: 0,
    longitude: 0,
    timestamp: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const getCurrentLocation = () => {
    setError('');
    setIsLoading(true);

    if (!navigator.geolocation) {
      setError('La geolocalización no está soportada en este dispositivo');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString()
        }));
        setIsLoading(false);
      },
      (error) => {
        setError('Error al obtener la ubicación: ' + error.message);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(prev => ({
      ...prev,
      name: e.target.value
    }));
  };

  const saveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error: supabaseError } = await supabase
        .from('ubicacion')
        .insert({
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          created_at: location.timestamp
        });

      if (supabaseError) throw supabaseError;

      alert('Ubicación guardada exitosamente');
      setLocation(prev => ({
        ...prev,
        name: ''
      }));
    } catch (err) {
      setError('Error al guardar la ubicación: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Geolocalizar</h1>
        
        <form onSubmit={saveLocation} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1">
              Nombre de la ubicación:
            </label>
            <input
              type="text"
              id="name"
              value={location.name}
              onChange={handleNameChange}
              className="w-full p-2 border rounded"
              required
              placeholder="Ej: Mi Casa"
            />
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={getCurrentLocation}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading ? 'Obteniendo ubicación...' : 'Obtener Ubicación Actual'}
            </button>

            {location.latitude !== 0 && (
              <div className="bg-gray-100 p-3 rounded">
                <p>Latitud: {location.latitude}</p>
                <p>Longitud: {location.longitude}</p>
              </div>
            )}

            {error && (
              <p className="text-red-500">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              disabled={isLoading || location.latitude === 0 || !location.name}
            >
              {isLoading ? 'Guardando...' : 'Guardar Ubicación'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}