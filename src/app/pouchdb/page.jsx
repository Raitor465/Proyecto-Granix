'use client';

import React, { useState, useEffect } from 'react';
import { openDB } from 'idb';

const OfflineFirstForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const initDB = async () => {
      await openDB('myDatabase', 1, {
        upgrade(db) {
          db.createObjectStore('userData', { keyPath: 'id', autoIncrement: true });
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
    const data = { name, email };

    try {
      const db = await openDB('myDatabase', 1);
      await db.add('userData', data);

      if (isOnline) {
        await syncWithServer();
      }

      setName('');
      setEmail('');
    } catch (error) {
      console.error('Error al guardar datos:', error);
    }
  };

  const syncWithServer = async () => {
    try {
      const db = await openDB('myDatabase', 1);
      const allData = await db.getAll('userData');

      if (allData.length > 0) {
        const response = await fetch('/api/saveData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(allData),
        });

        if (response.ok) {
          await db.clear('userData');
          console.log('Datos sincronizados con el servidor');
        } else {
          throw new Error('Error al sincronizar con el servidor');
        }
      }
    } catch (error) {
      console.error('Error al sincronizar con el servidor:', error);
    }
  };

  useEffect(() => {
    if (isOnline) {
      syncWithServer();
    }
  }, [isOnline]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Formulario Offline-First</h2>
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
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Guardar
        </button>
      </form>
      <p className="mt-4">
        Estado: {isOnline ? 'En línea' : 'Fuera de línea'}
      </p>
    </div>
  );
};

export default OfflineFirstForm;