"use client";
import React, { useEffect } from "react";
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Menu, MoreHorizontal, LogOut } from 'lucide-react';
import { RutaDeVisita } from "../crearruta/page";
import { setUpDataBase } from "@/lib/indexedDB";

interface RouteButton {
  title: string;
  description: string;
}

// Solamente ejemplo cambiar después
const allButtons: RouteButton[] = [
  { title: "Punto 1", description: "Descripción del punto 1" },
  { title: "Punto 2", description: "Descripción del punto 2" },
  { title: "Punto 3", description: "Descripción del punto 3" },
  { title: "Punto 4", description: "Descripción del punto 4" },
  { title: "Punto 5", description: "Descripción del punto 5" },
  { title: "Punto 6", description: "Descripción del punto 6" },
  { title: "Punto 7", description: "Descripción del punto 7" },
];

const botones_por_pagina = 5;

export default function RutaVisita() {
  const [clienteInfo,setClienteInfo] = useState<RutaDeVisita[]>([]);
  const [pagina_actual, setpagina_actual] = useState(1);

  const totalPages = Math.ceil(clienteInfo.length / botones_por_pagina);
  const startIndex = (pagina_actual - 1) * botones_por_pagina;
  const buttonsToShow = clienteInfo.slice(startIndex, startIndex + botones_por_pagina);

  const antPag = () => setpagina_actual(prev => Math.max(prev - 1, 1));
  const sigPag = () => setpagina_actual(prev => Math.min(prev + 1, totalPages));

  async function ClienteInfo() {
      const db = await setUpDataBase();
      const tx = db.transaction('RutaDeVisita','readonly');
      const rutas = await tx.store.getAll();
      setClienteInfo(rutas)
      tx.done;
  }
  useEffect(() => {
    ClienteInfo(); // Llama a la función para cargar los datos cuando el componente se monta
  }, []);



  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-primary text-primary-foreground">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={antPag}
            disabled={pagina_actual === 1}
            className="bg-gray-300 p-4 rounded-md hover:bg-gray-300 transition duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Página anterior</span>
          </button>
          <span className="text-xl font-bold text-primary">Página {pagina_actual} de {totalPages}</span>
          <button
            onClick={sigPag}
            disabled={pagina_actual === totalPages}
            className="bg-gray-300 p-4 rounded-md hover:bg-gray-300 transition duration-200"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Página siguiente</span>
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col p-4 space-y-4">
        {buttonsToShow.map((button, index) => (
          <button
            key={index}
            className="w-full h-auto py-4 flex flex-col items-start text-left border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition duration-200"
            onClick={() => alert(`Clicked on ${button.nombre}`)} // Acciones al hacer clic
          >
            <span className="text-lg font-semibold pl-2">{button.nombre}</span>
            <span className="text-sm text-gray-600 pl-2">{button.orden_visita + ' ' +button.nombre}</span>
          </button>
        ))}

        {/* Sección del contador de completados */}
        <div className="flex justify-center mt-4">
          <span className="text-lg font-semibold text-gray-700">
            Completados: 0 {/* Este valor será dinámico más adelante */}
          </span>
        </div>
      </main>

      <footer className="p-4 bg-muted">
        <div className="grid grid-cols-3 gap-4">
          <button className="bg-gray-300 p-4 text-lg rounded-lg hover:bg-gray-400 transition duration-200 w-full flex items-center">
            <Menu className="mr-4 h-6 w-6" />
            <span className="pl-2">Menú</span>
          </button>
          <button className="bg-gray-300 p-4 text-lg rounded-lg hover:bg-gray-400 transition duration-200 w-full flex items-center">
            <MoreHorizontal className="mr-4 h-6 w-6" />
            <span className="pl-2">Más opciones</span>
          </button>
          <button className="bg-gray-300 p-4 text-lg rounded-lg hover:bg-gray-400 transition duration-200 w-full flex items-center">
            <LogOut className="mr-4 h-6 w-6" />
            <span className="pl-2">Salir</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
