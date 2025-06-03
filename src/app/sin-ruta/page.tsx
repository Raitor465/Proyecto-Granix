'use client'
import React, { useEffect, useState } from "react";
import { ChevronRight, ChevronLeft, MoreHorizontal, Menu, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { setUpDataBase } from "@/lib/indexedDB";
import { Cliente } from "../crearruta/page";

const botones_por_pagina = 5;

const sinRuta: React.FC = () => {
  const router = useRouter();
  const [clienteInfo, setClienteInfo] = useState<Cliente[]>([]);
  const [pagina_actual, setpagina_actual] = useState(1);
  const [filtroNombre, setFiltroNombre] = useState('');

  const clientesFiltrados = clienteInfo.filter(cliente =>
    cliente.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(clientesFiltrados.length / botones_por_pagina));
  const startIndex = (pagina_actual - 1) * botones_por_pagina;
  const buttonsToShow = clientesFiltrados.slice(startIndex, startIndex + botones_por_pagina);

  const antPag = () => setpagina_actual(prev => Math.max(prev - 1, 1));
  const sigPag = () => setpagina_actual(prev => Math.min(prev + 1, totalPages));

  async function ClienteInfo() {
    const db = await setUpDataBase();
    const tx = db.transaction('RutaDeVisita', 'readonly');
    const clientes = await tx.store.getAll();
    setClienteInfo(clientes);
    await tx.done;
  }

  useEffect(() => {
    ClienteInfo();
  }, []);

  // Ajusta la página actual si el filtro reduce la cantidad de páginas disponibles
  useEffect(() => {
    const nuevasPaginas = Math.ceil(clientesFiltrados.length / botones_por_pagina);
    setpagina_actual(prev => Math.min(prev, nuevasPaginas || 1));
  }, [filtroNombre, clienteInfo]);

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
          <span className="text-xl font-bold text-primary">
            Página {pagina_actual} de {totalPages}
          </span>
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

      <div className="p-4">
        <input
          type="text"
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          placeholder="Buscar por nombre."
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <main className="flex-grow flex flex-col p-4 space-y-4">
        {buttonsToShow.map((button, index) => (
          <button
            key={index}
            className="w-full h-auto py-4 flex flex-col items-start text-left border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition duration-200"
          >
            <span className="text-lg font-semibold pl-2">
              {'[' + button.orden_visita + '] ' + button.nombre}
            </span>
            <span className="text-sm text-gray-600 pl-2">
              {button.Direccion.calle + ' ' + button.Direccion.numero + ' (' + button.CODCL + ')'}
            </span>
          </button>
        ))}
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
};

export default sinRuta;
