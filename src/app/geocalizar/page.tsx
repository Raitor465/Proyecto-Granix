'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { setUpDataBase } from '@/lib/indexedDB';
import { Cliente } from '../crearruta/page';

interface LocationData {
  id : number;
  name: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export default function GeolocalizarPage() {
  const [locationData, setLocation] = useState<LocationData | null>(null);
  const [locationActual, setLocationActual] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');




  async function ClienteInfo() {
    const db = await setUpDataBase();
    const tx = db.transaction('ClienteSucursal','readonly');
    const clientes = await tx.store.getAll() as Cliente[];
    const location = {
        id : clientes[0].CODCL,
        name: `${clientes[0].nombre}, ${clientes[0].Direccion.calle} ${clientes[0].Direccion.numero}`,
        latitude : clientes[0].Direccion.latitud,
        longitude : clientes[0].Direccion.longitud,
        timestamp: new Date().toISOString(),
    }
    setLocation(location)
    tx.done;
    }
    useEffect(() => {
        ClienteInfo(); // Llama a la función para cargar los datos cuando el componente se monta
    }, []);


  // const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setLocation(prev => ({
  //     ...prev,
  //     name: e.target.value
  //   }));
  // };
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
        setLocationActual((prev) => ({
          ...(prev || {id : 0, name: '', latitude: 0, longitude: 0, timestamp: '' }),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString(),
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
    console.log(locationActual)
  };


  const saveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!locationActual) {
      setError('No hay datos de ubicación para guardar.');
      setIsLoading(false);
      return;
    }

    if (!locationData || locationData.id === undefined) {
      setError('No se encontró información del cliente para actualizar.');
      setIsLoading(false);
      return;
    }

    try {
      const db = await setUpDataBase();
      const tx = db.transaction('ClienteSucursal', 'readwrite');
      const store = tx.store;
  
      const cliente = await store.get(locationData.id);
  
      if (!cliente) {
        setError('Cliente no encontrado en la base de datos.');
        setIsLoading(false);
        return;
      }
  
      cliente.Direccion.latitud = locationActual.latitude;
      cliente.Direccion.longitud = locationActual.longitude;
  
      await store.put(cliente);
  
      alert('Ubicación actualizada exitosamente.');
    } catch (error) {
      setError('Error al guardar la ubicación: ' + (error as Error).message);
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
              value={locationData?.name || ''}
              // onChange={handleNameChange}
              className="w-full p-2 border rounded"
              disabled
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

            {locationActual && locationActual.latitude !== 0 && (
              <div className="bg-gray-100 p-3 rounded">
                <p>Latitud: {locationActual.latitude}</p>
                <p>Longitud: {locationActual.longitude}</p>
              </div>
            )}

            {error && (
              <p className="text-red-500">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              disabled={isLoading || !locationActual}
            >
              {isLoading ? 'Guardando...' : 'Guardar Ubicación'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}