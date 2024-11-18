'use client';

import React, { useState, useEffect } from 'react';
import { openDB } from 'idb';

const DB_NAME = 'OfflineDataDB';
const STORE_NAME = 'pendingData';

async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { autoIncrement: true });
    },
  });
}

export default function OfflineFirstDataSubmissionForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      syncData();
    }
  }, [isOnline]);

  const saveLocally = async (data) => {
    const db = await initDB();
    await db.add(STORE_NAME, data);
  };

  const syncData = async () => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const items = await store.getAll();

    for (const item of items) {
      try {
        const response = await fetch('/api/saveData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([item]),
        });
        if (response.ok) {
          await store.delete(item.id);
        }
      } catch (error) {
        console.error('Error syncing data:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { name, email };

    if (isOnline) {
      try {
        const response = await fetch('/api/saveData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([data]),
        });
        if (response.ok) {
          console.log('Data sent successfully');
        } else {
          throw new Error('Failed to send data');
        }
      } catch (error) {
        console.error('Error sending data:', error);
        await saveLocally(data);
      }
    } else {
      await saveLocally(data);
    }

    setName('');
    setEmail('');
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
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
          Enviar
        </button>
      </form>
      <p className="mt-4">
        Estado: {isOnline ? 'En línea' : 'Fuera de línea'}
      </p>
    </div>
  );
}