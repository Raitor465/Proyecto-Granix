'use client';

import React, { useState, useEffect } from 'react';
import { openDB } from 'idb';
import { supabase } from '@/lib/supabase';

const TestConnectionButton = () => {
  const [isTesting, setIsTesting] = useState(false);

  const testConnection = async () => {
    if (isTesting) return;
    
    setIsTesting(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Error de conexión:', error);
        alert('Error al conectar con Supabase: ' + error.message);
      } else {
        console.log('Conexión exitosa');
        alert('Conexión exitosa con Supabase!');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error: ' + err.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <button 
      onClick={testConnection}
      disabled={isTesting}
      className="mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
    >
      {isTesting ? 'Probando...' : 'Probar Conexión'}
    </button>
  );
};

const OfflineFirstForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const initDB = async () => {
      await openDB('myDatabase', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('userData')) {
            db.createObjectStore('userData', { 
              keyPath: 'id',
              autoIncrement: true 
            });
          }
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
      console.log('Datos guardados en IndexedDB:', data);

      if (isOnline) {
        await syncWithSupabase();
      }

      setName('');
      setEmail('');
      alert('Datos guardados correctamente');
    } catch (error) {
      console.error('Error al guardar datos:', error);
      alert('Error al guardar los datos: ' + error.message);
    }
  };

  const syncWithSupabase = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    let db;
    try {
      db = await openDB('myDatabase', 1);
      
      // Obtener todos los registros no sincronizados
      const tx = db.transaction('userData', 'readwrite');
      const store = tx.objectStore('userData');
      const unsyncedRecords = await store.getAll();
      
      // Filtrar solo los registros no sincronizados
      const recordsToSync = unsyncedRecords.filter(record => !record.synced);
      
      // Sincronizar cada registro
      for (const record of recordsToSync) {
        try {
          const { error } = await supabase
            .from('users')
            .insert({
              name: record.name,
              email: record.email,
              created_at: record.created_at
            });

          if (!error) {
            // Marcar como sincronizado y eliminar
            await store.delete(record.id);
            console.log('Registro sincronizado y eliminado:', record);
          } else {
            console.error('Error al sincronizar registro:', error);
          }
        } catch (syncError) {
          console.error('Error en la sincronización del registro:', syncError);
        }
      }

      await tx.done;
      console.log('Sincronización completada');

    } catch (error) {
      console.error('Error en el proceso de sincronización:', error);
    } finally {
      setIsSyncing(false);
      if (db) {
        db.close();
      }
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
        <button 
          type="submit" 
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={isSyncing}
        >
          {isSyncing ? 'Sincronizando...' : 'Guardar'}
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
