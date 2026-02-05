'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { setUpDataBase } from '@/lib/indexedDB';
import { Cliente } from '../crearruta/page';
import { LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
    const [key, setKey] = useState(0); // Para forzar re-render del mapa


    async function ClienteInfo() {
        // Obtener el CODCL desde IndexedDB
        const db = await setUpDataBase();
        const tx = db.transaction('ClienteSucursal','readonly');
        const clientes = await tx.store.getAll() as Cliente[];
        await tx.done;
        
        if (clientes.length === 0) {
            console.error('No hay clientes en IndexedDB');
            return;
        }
        
        const codcl = clientes[0].CODCL;
        
        // 1. Obtener el direccion_id desde ClienteSucursal
        const { data: clienteData, error: clienteError } = await supabase
            .from('ClienteSucursal')
            .select('CODCL, nombre, direccion_id')
            .eq('CODCL', codcl)
            .single();
        
        if (clienteError || !clienteData) {
            console.error('Error al cargar cliente desde Supabase:', clienteError);
            // Fallback a IndexedDB si falla Supabase
            const cliente = clientes[0];
            const newLocation = {
                name: `${cliente.nombre} ${cliente.Direccion.calle} ${cliente.Direccion.numero}`,
                latitude : cliente.Direccion.latitud,
                longitude : cliente.Direccion.longitud,
                created_at: new Date().toISOString(),
            }
            setLocations(newLocation);
            setMapCenter([newLocation.latitude, newLocation.longitude]);
            setKey(prev => prev + 1);
            return;
        }
        
        // 2. Obtener las coordenadas desde la tabla Direccion
        const { data: direccionData, error: direccionError } = await supabase
            .from('Direccion')
            .select('calle, numero, latitud, longitud')
            .eq('direccion_id', clienteData.direccion_id)
            .single();
        
        if (direccionError || !direccionData) {
            console.error('Error al cargar dirección desde Supabase:', direccionError);
            // Fallback a IndexedDB
            const cliente = clientes[0];
            const newLocation = {
                name: `${cliente.nombre} ${cliente.Direccion.calle} ${cliente.Direccion.numero}`,
                latitude : cliente.Direccion.latitud,
                longitude : cliente.Direccion.longitud,
                created_at: new Date().toISOString(),
            }
            setLocations(newLocation);
            setMapCenter([newLocation.latitude, newLocation.longitude]);
            setKey(prev => prev + 1);
            return;
        }
        
        const newLocation = {
            name: `${clienteData.nombre} ${direccionData.calle} ${direccionData.numero}`,
            latitude : direccionData.latitud,
            longitude : direccionData.longitud,
            created_at: new Date().toISOString(),
        }
        
        setLocations(newLocation);
        setMapCenter([newLocation.latitude, newLocation.longitude]);
        setKey(prev => prev + 1); // Forzar re-render del mapa
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
          <div className="flex gap-2">
            <button 
              onClick={ClienteInfo}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Actualizar Ubicación
            </button>
            <Link 
              href="/geocalizar" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Nueva Ubicación
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mapa */}
          <div className="md:col-span-2 h-[calc(100vh-200px)]">
            {location && (
              <MapWithNoSSR
                key={key}
                location={location}
                center={mapCenter}
                zoom={16}
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