'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { setUpDataBase } from '@/lib/indexedDB';
import { Cliente } from '../crearruta/page';
import { LogOut} from 'lucide-react';

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
      // 1. Actualizar en IndexedDB (local)
      const db = await setUpDataBase();
      const tx = db.transaction('ClienteSucursal', 'readwrite');
      const store = tx.store;
  
      const cliente = await store.get(locationData.id);
  
      if (!cliente) {
        setError('Cliente no encontrado en la base de datos.');
        setIsLoading(false);
        return;
      }

      // Crear una copia profunda del cliente para evitar problemas de referencia
      const clienteActualizado = JSON.parse(JSON.stringify(cliente));
      clienteActualizado.Direccion.latitud = locationActual.latitude;
      clienteActualizado.Direccion.longitud = locationActual.longitude;

      // Eliminar el registro viejo y agregar el nuevo
      await store.delete(locationData.id);
      await store.add(clienteActualizado);
      
      await tx.done;
      
      // Cerrar la conexión para forzar que se reabra en la próxima lectura
      db.close();

      // Verificar que se guardó correctamente leyendo de nuevo
      const db2 = await setUpDataBase();
      const tx2 = db2.transaction('ClienteSucursal', 'readonly');
      const clienteVerificado = await tx2.store.get(locationData.id);
      console.log('🔍 Verificación - Cliente después de guardar:', clienteVerificado);
      console.log('🔍 Coordenadas verificadas:', {
        lat: clienteVerificado.Direccion.latitud,
        lng: clienteVerificado.Direccion.longitud
      });
      await tx2.done;

      // 2. Obtener el direccion_id del cliente en Supabase
      const { data: clienteData, error: clienteError } = await supabase
        .from('ClienteSucursal')
        .select('direccion_id')
        .eq('CODCL', locationData.id)
        .single();

      if (clienteError || !clienteData) {
        console.error('Error al obtener cliente de Supabase:', clienteError);
        setError('Ubicación guardada localmente, pero no se pudo obtener la información del servidor.');
        setIsLoading(false);
        return;
      }

      // 3. Actualizar la tabla Direccion en Supabase
      const { error: supabaseError } = await supabase
        .from('Direccion')
        .update({
          latitud: locationActual.latitude,
          longitud: locationActual.longitude
        })
        .eq('direccion_id', clienteData.direccion_id);

      if (supabaseError) {
        console.error('Error al actualizar en Supabase:', supabaseError);
        setError('Ubicación guardada localmente, pero hubo un error al sincronizar con el servidor: ' + supabaseError.message);
      } else {
        // Recargar el cliente desde Supabase para sincronizar IndexedDB
        const { data: clienteActualizado, error: errorRecarga } = await supabase
          .from('ClienteSucursal')
          .select('*, Direccion(*)')
          .eq('CODCL', locationData.id)
          .single();
        
        if (!errorRecarga && clienteActualizado) {
          // Actualizar IndexedDB con los datos frescos de Supabase
          const db3 = await setUpDataBase();
          const tx3 = db3.transaction('ClienteSucursal', 'readwrite');
          
          // Eliminar el viejo
          await tx3.store.delete(locationData.id);
          
          // Transformar los datos para que coincidan con la estructura esperada
          const clienteParaIndexedDB = {
            ...clienteActualizado,
            Direccion: {
              calle: clienteActualizado.Direccion.calle,
              numero: clienteActualizado.Direccion.numero,
              latitud: clienteActualizado.Direccion.latitud,
              longitud: clienteActualizado.Direccion.longitud
            }
          };
          
          // Agregar el nuevo con datos de Supabase
          await tx3.store.add(clienteParaIndexedDB);
          await tx3.done;
          db3.close();
          
          alert('Ubicación actualizada exitosamente en local y en el servidor.');
        } else {
          console.error('Error al recargar desde Supabase:', errorRecarga);
          alert('Ubicación actualizada en Supabase pero hubo un error al sincronizar localmente.');
        }
      }
    } catch (error) {
      console.error('Error al guardar ubicación:', error);
      setError('Error al guardar la ubicación: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }

  };

  // Función para manejar la navegación a otra página (ruta de visita)
  const handleNavigation = () => {
    window.location.href = "/rutavisita"; // Redirige al usuario a la ruta de visita
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
        <footer className="p-4 bg-muted">
                <div className="flex justify-between">
                <button onClick={handleNavigation} className="bg-gray-300 p-3 text-sm rounded-lg hover:bg-gray-400 transition duration-200 flex items-center">
                        <LogOut onClick={handleNavigation} className="mr-2 h-5 w-5" />
                        <span className="pl-1">Volver</span>
                    </button>
                </div>
            </footer>
      </div>
    </main>
  );
}