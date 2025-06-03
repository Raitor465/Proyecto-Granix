'use client'
import React from "react";
import { Route, Ban, FileText, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

const MenuInicial: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 bg-gray-100">
      <main className="flex flex-col items-center justify-center flex-grow w-full">
        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => router.push('/crearruta')}
            className="bg-white shadow-md p-6 rounded-2xl flex flex-col items-center hover:bg-gray-200 transition"
          >
            <Route className="h-8 w-8 mb-2" />
            <span className="text-lg">Ruta de visita</span>
          </button>

          <button
            onClick={() => router.push('/sin-ruta')}
            className="bg-white shadow-md p-6 rounded-2xl flex flex-col items-center hover:bg-gray-200 transition"
          >
            <Ban className="h-8 w-8 mb-2" />
            <span className="text-lg">Sin ruta de visita</span>
          </button>

          <button
            onClick={() => router.push('/resumen')}
            className="bg-white shadow-md p-6 rounded-2xl flex flex-col items-center hover:bg-gray-200 transition"
          >
            <FileText className="h-8 w-8 mb-2" />
            <span className="text-lg">Resumen</span>
          </button>

          <button
            onClick={() => router.push('/')}
            className="bg-white shadow-md p-6 rounded-2xl flex flex-col items-center hover:bg-red-200 transition"
          >
            <LogOut className="h-8 w-8 mb-2 text-red-500" />
            <span className="text-lg text-red-500">Salir</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default MenuInicial;
