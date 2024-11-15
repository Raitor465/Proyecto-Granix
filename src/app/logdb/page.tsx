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
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const initDB = async () => {
      await openDB('myDatabase', 1, {
        upgrade(db) {
          if (db.objectStoreNames.contains('userData')) {
            db.deleteObjectStore('userData');
          }
          const store = db.createObjectStore('userData', { 
            keyPath: 'id',
            autoIncrement: true 
          });
          store.createIndex('created_at', 'created_at', { unique: true });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveData = async (e) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    const data = { 
      name: formData.name,
      email: formData.email,
      created_at: now,
      synced: false
    };

    try {
      const db = await openDB('myDatabase', 1);
      await db.add('userData', data);
      console.log('Datos guardados en IndexedDB:', data);

      if (isOnline) {
        await syncWithSupabase();
      }

      setFormData({
        name: '',
        email: ''
      });
      
      alert('Datos guardados correctamente');
    } catch (error) {
      console.error('Error al guardar datos:', error);
      alert('Error al guardar los datos: ' + error.message);
    }
  };

  const clearLocalData = async () => {
    try {
      const db = await openDB('myDatabase', 1);
      const tx = db.transaction('userData', 'readwrite');
      const store = tx.objectStore('userData');
      await store.clear();
      await tx.done;
      console.log('Datos locales limpiados correctamente');
    } catch (error) {
      console.error('Error al limpiar datos locales:', error);
    }
  };

  const syncWithSupabase = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    let db;
    let syncSuccessful = true;
    
    try {
      db = await openDB('myDatabase', 1);
      const tx = db.transaction('userData', 'readwrite');
      const store = tx.objectStore('userData');
      
      const records = await store.getAll();
      const unsynced = records.filter(record => !record.synced);
      
      for (const record of unsynced) {
        try {
          const { data, error } = await supabase
            .from('users')
            .insert({
              name: record.name,
              email: record.email,
              created_at: record.created_at
            })
            .select();

          if (error) {
            console.error('Error al sincronizar:', error);
            syncSuccessful = false;
            break;
          }
        } catch (err) {
          console.error('Error en sincronización:', err);
          syncSuccessful = false;
          break;
        }
      }

      await tx.done;
      
      // Solo limpiamos los datos locales si la sincronización fue exitosa
      if (syncSuccessful) {
        await clearLocalData();
        setLastSync(new Date().toISOString());
        console.log('Sincronización completada y datos locales limpiados');
      }
      
    } catch (error) {
      console.error('Error en proceso de sincronización:', error);
    } finally {
      setIsSyncing(false);
      if (db) db.close();
    }
  };

  useEffect(() => {
    if (isOnline && lastSync === null) {
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
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
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