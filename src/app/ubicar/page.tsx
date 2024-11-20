'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { setUpDataBase } from '@/lib/indexedDB';
import { Cliente } from '../crearruta/page';
import { LogOut } from 'lucide-react';

interface Location {
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
    const [location, setLocations] = useState<Location | null>({name: '', latitude: 0, longitude: 0, created_at: '' });
    const [mapCenter, setMapCenter] = useState<[number, number]>([-34.6037, -58.3816]); // Default to Buenos Aires
    const [mapZoom, setMapZoom] = useState(16);


    async function ClienteInfo() {
        const db = await setUpDataBase();
        const tx = db.transaction('ClienteSucursal','readonly');
        const clientes = await tx.store.getAll() as Cliente[];
        const location = {
            name: `${clientes[0].nombre} ${clientes[0].Direccion.calle} ${clientes[0].Direccion.numero}`,
            latitude : clientes[0].Direccion.latitud,
            longitude : clientes[0].Direccion.longitud,
            created_at: new Date().toISOString(),
        }
        setLocations(location)
        setMapCenter([location.latitude,location.longitude])
        tx.done;
        }
    useEffect(() => {
        ClienteInfo();
    }, []);


    // Función para manejar la navegación a otra página (ruta de visita)
    const handleNavigation = () => {
      window.location.href = "/rutavisita"; // Redirige al usuario a la ruta de visita
    };

  return (
    <main className="min-h-screen">
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Ubicaciones Guardadas</h1>
          <Link 
            href="/geocalizar" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Nueva Ubicación
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mapa */}
          <div className="md:col-span-2 h-[calc(100vh-200px)]">
            {location && (
              <MapWithNoSSR
                location={location}
                center={mapCenter}
                zoom={mapZoom}
              />
            )}
          </div>
        </div>
            <button onClick={handleNavigation} className="bg-gray-300 p-3 text-sm rounded-lg hover:bg-gray-400 transition duration-200 flex items-center">
                  <LogOut onClick={handleNavigation} className="mr-2 h-5 w-5" />
                  <span className="pl-1">Volver</span>
            </button>
      </div>
    </main>
  );
}