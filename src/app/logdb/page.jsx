'use client';

import React, { useState, useEffect } from 'react';
import { openDB } from 'idb';
import { supabase } from '@/lib/supabase';

// Componente de prueba de conexión
const TestConnectionButton = () => {
  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            name: 'Test User',
            email: 'test@example.com'
          }
        ])
        .select();

      if (error) {
        console.error('Error de inserción:', error);
        alert('Error al insertar: ' + error.message);
      } else {
        console.log('Datos insertados:', data);
        alert('Conexión exitosa! Datos insertados correctamente');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error: ' + err.message);
    }
  };

  return (
    <button 
      onClick={testConnection}
      className="mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600"
    >
      Probar Conexión
    </button>
  );
};

const OfflineFirstForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const initDB = async () => {
      await openDB('myDatabase', 1, {
        upgrade(db) {
          db.createObjectStore('userData', { 
            keyPath: 'id',
            autoIncrement: true 
          });
        },
      });
    };

    initDB();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveData = async (e) => {
    e.preventDefault();
    const data = { 
      name, 
      email,
      created_at: new Date().toISOString(),
      synced: false
    };

    try {
      const db = await openDB('myDatabase', 1);
      await db.add('userData', data);

      if (isOnline) {
        await syncWithSupabase();
      }

      setName('');
      setEmail('');
    } catch (error) {
      console.error('Error al guardar datos:', error);
    }
  };

  const syncWithSupabase = async () => {
    try {
      const db = await openDB('myDatabase', 1);
      const tx = db.transaction('userData', 'readwrite');
      const store = tx.objectStore('userData');
      const unsyncedData = await store.getAll();

      // Filtramos solo los datos no sincronizados
      const dataToSync = unsyncedData.filter(item => !item.synced);

      if (dataToSync.length > 0) {
        for (const item of dataToSync) {
          // Insertamos cada registro en Supabase
          const { error } = await supabase
            .from('users')
            .insert({
              name: item.name,
              email: item.email,
              created_at: item.created_at
            });

          if (!error) {
            // Marcamos el registro como sincronizado en IndexedDB
            await store.put({
              ...item,
              synced: true
            });
          } else {
            console.error('Error al sincronizar con Supabase:', error);
          }
        }

        // Eliminamos los registros sincronizados
        const syncedData = await store.getAll();
        for (const item of syncedData) {
          if (item.synced) {
            await store.delete(item.id);
          }
        }

        console.log('Datos sincronizados con Supabase');
      }
    } catch (error) {
      console.error('Error en la sincronización:', error);
    }
  };

  useEffect(() => {
    if (isOnline) {
      syncWithSupabase();
    }
  }, [isOnline]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Formulario Offline-First con Supabase</h2>
      <form onSubmit={saveData} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1">Nombre:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Guardar
        </button>
      </form>
      <p className="mt-4">
        Estado: <span className={`font-bold ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
          {isOnline ? 'En línea' : 'Fuera de línea'}
        </span>
      </p>
      <TestConnectionButton />
    </div>
  );
};

export default OfflineFirstForm;