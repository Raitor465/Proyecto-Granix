"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Menu, MoreHorizontal, LogOut, Clipboard, Tag, MapPin, DollarSign, FileText, RefreshCw, Map, X, Wallet } from 'lucide-react';
import { Cliente } from "../crearruta/page";
import { setUpDataBase } from "@/lib/indexedDB";
import Link from 'next/link';

const botones_por_pagina = 5;

const opciones = [
  { name: "Cargar Pedido", icon: Clipboard, link: "/tomarpedido" },
  { name: "Registrar Precios", icon: Tag, link: "/registrarprecios" },
  { name: "Ubicar Cliente", icon: MapPin, link: "/ubicar-cliente" },
  { name: "Solicitud de Pago", icon: DollarSign, link: "/solicitudpago" },
  { name: "Deuda Entidad", icon: FileText, link: "/deuda" },
  { name: "Actualizar Datos", icon: RefreshCw, link: "/actualizar-datos" },
  { name: "Geocalizar", icon: Map, link: "/geocalizar" },
];

const tieneDeudas = (cliente: { deudas?: any[] }) => {
  return cliente.deudas && cliente.deudas.length > 0;
};

export default function RutaVisita() {
  const [clienteInfo, setClienteInfo] = useState<Cliente[]>([]);
  const [pagina_actual, setpagina_actual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);

  const totalPages = Math.ceil(clienteInfo.length / botones_por_pagina);
  const startIndex = (pagina_actual - 1) * botones_por_pagina;
  const buttonsToShow = clienteInfo.slice(startIndex, startIndex + botones_por_pagina);

  const antPag = () => setpagina_actual(prev => Math.max(prev - 1, 1));
  const sigPag = () => setpagina_actual(prev => Math.min(prev + 1, totalPages));

  async function abrirModal(cliente: Cliente) {
    try {
      const db = await setUpDataBase();
      const tx = db.transaction('ClienteSucursal', 'readwrite');
      const store = tx.objectStore('ClienteSucursal');
      await store.clear();
      await store.add(cliente);
      await tx.done;
    } catch (error) {
      console.error('Error al abrir el modal', error)
    }
    setMostrarModal(true);
  };

  const cerrarModal = () => setMostrarModal(false);

  async function ClienteInfo() {
    const db = await setUpDataBase();
    const tx = db.transaction('RutaDeVisita', 'readonly');
    const clientes = await tx.store.getAll();
    setClienteInfo(clientes)
    tx.done;
  }

  useEffect(() => {
    ClienteInfo();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-primary text-primary-foreground">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={antPag}
            disabled={pagina_actual === 1}
            className="bg-gray-300 p-4 rounded-md hover:bg-gray-400 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Página anterior</span>
          </button>
          <span className="text-xl font-bold">
            Página {pagina_actual} de {totalPages}
          </span>
          <button
            onClick={sigPag}
            disabled={pagina_actual === totalPages}
            className="bg-gray-300 p-4 rounded-md hover:bg-gray-400 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="w-full h-auto py-4 flex flex-col items-start text-left border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition duration-200 relative"
            onClick={() => abrirModal(button)}
          >
            {tieneDeudas(button) && (
              <Wallet className="absolute top-0 right-0 h-6 w-6 text-red-500 m-2" />
            )}
            <span className="text-lg font-semibold pl-2">{'[' + button.orden_visita + ']' + ' ' + button.nombre}</span>
            <span className="text-sm text-gray-600 pl-2">{button.Direccion.calle + '' + button.Direccion.numero + ' (' + button.CODCL + ')'}</span>
          </button>
        ))}
      </main>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full m-4">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-2xl font-bold">Opciones</h2>
              <button
                onClick={cerrarModal}
                className="p-2 rounded-full hover:bg-gray-200 transition duration-200"
                aria-label="Cerrar"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
                {opciones.map((opcion, index) => (
                  <Link key={index} href={opcion.link} className="group">
                    <div className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 transition duration-200">
                      <opcion.icon className="h-12 w-12 text-primary group-hover:text-primary-dark transition-colors duration-200" />
                      <p className="mt-2 text-center text-sm font-medium">{opcion.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="p-4 bg-muted">
        <div className="grid grid-cols-3 gap-4">
          <button className="bg-gray-300 p-4 text-lg rounded-lg hover:bg-gray-400 transition duration-200 w-full flex items-center justify-center">
            <Menu className="mr-2 h-6 w-6" />
            <span>Menú</span>
          </button>
          <button className="bg-gray-300 p-4 text-lg rounded-lg hover:bg-gray-400 transition duration-200 w-full flex items-center justify-center">
            <MoreHorizontal className="mr-2 h-6 w-6" />
            <span>Más opciones</span>
          </button>
          <button className="bg-gray-300 p-4 text-lg rounded-lg hover:bg-gray-400 transition duration-200 w-full flex items-center justify-center">
            <LogOut className="mr-2 h-6 w-6" />
            <span>Salir</span>
          </button>
        </div>
      </footer>
    </div>
  );
}