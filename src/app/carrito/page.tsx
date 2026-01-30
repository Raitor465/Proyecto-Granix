"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function Carrito() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="p-4 bg-blue-500 text-white">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="bg-white text-blue-500 p-2 rounded-md hover:bg-gray-100 transition duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">Carrito de Cambios</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow p-4">
        <div className="bg-white rounded-lg shadow-md p-6 h-full">
          <p className="text-gray-500 text-center">Aquí aparecerán los cambios de precios pendientes</p>
        </div>
      </main>
    </div>
  );
}
