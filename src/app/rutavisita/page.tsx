"use client";

import React, { useEffect } from "react";
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Menu, MoreHorizontal, LogOut, Clipboard
  , Tag, MapPin, DollarSign, FileText, RefreshCw, Map, X } from 'lucide-react';
import { Cliente } from "../crearruta/page";
import { eliminarBaseDeDatosCompleta, setUpDataBase } from "@/lib/indexedDB";
import Link from 'next/link';

const botones_por_pagina = 5;

const opciones = [
  { name: "Cargar Pedido", icon: Clipboard, link: "/tomarpedido" },
  { name: "Registrar Precios", icon: Tag, link: "/registrarprecios" },
  { name: "Ubicar Cliente", icon: MapPin, link: "/ubicar" },
  { name: "Solicitud de Pago", icon: DollarSign, link: "/solicitudpago" },
  { name: "Deuda Entidad", icon: FileText, link: "/deuda" },
  { name: "Actualizar Datos", icon: RefreshCw, link: "/actualizardatos" },
  { name: "Geocalizar", icon: Map, link: "/geocalizar" },
];

export default function RutaVisita() {
  const [clienteInfo,setClienteInfo] = useState<Cliente[]>([]);
  const [pagina_actual, setpagina_actual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);

  const totalPages = Math.ceil(clienteInfo.length / botones_por_pagina);
  const startIndex = (pagina_actual - 1) * botones_por_pagina;
  const buttonsToShow = clienteInfo.slice(startIndex, startIndex + botones_por_pagina);


  const antPag = () => setpagina_actual(prev => Math.max(prev - 1, 1));
  const sigPag = () => setpagina_actual(prev => Math.min(prev + 1, totalPages));
  async function abrirModal (cliente : Cliente) {
    try{
      const db = await setUpDataBase();
      const tx = db.transaction('ClienteSucursal', 'readwrite');
      const store = tx.objectStore('ClienteSucursal');
      await store.clear();
      await store.add(cliente);
      await tx.done;
    }catch (error){
      console.error('Error al abrir el modal',error)
    }
    
    setMostrarModal(true)
  }
  const cerrarModal = () => setMostrarModal(false);


  async function ClienteInfo() {
      const db = await setUpDataBase();
      const tx = db.transaction('RutaDeVisita','readonly');
      const clientes = await tx.store.getAll();
      setClienteInfo(clientes)
      tx.done;
  }
  useEffect(() => {
    ClienteInfo(); // Llama a la función para cargar los datos cuando el componente se monta
  }, []);


  const logout = async () => {
    try {
      // Establece isLoggedIn como false en Session Storage
      sessionStorage.setItem("isLoggedIn", "false");
  
      // Opcional: Limpia otros datos almacenados en sessionStorage
      sessionStorage.removeItem("vendedorId");
      sessionStorage.removeItem("vendedorData");
  
      // Limpia datos de IndexedDB si es necesario
      const db = await setUpDataBase();
      const tx = db.transaction(["ClienteSucursal", "RutaDeVisita"], "readwrite");
      tx.objectStore("ClienteSucursal").clear();
      tx.objectStore("RutaDeVisita").clear();
      await tx.done;
      // await eliminarBaseDeDatosCompleta();
  
      // Redirige al usuario a la página de login
      window.location.href = "/";
    } catch (error) {
      console.error("Error durante el logout", error);
      alert("Ocurrió un error al cerrar sesión");
    }
  };


  return (
    <div className="min-h-screen flex flex-col">
      {/* Aquí el contenido original de la página */}
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

      <main className="flex-grow flex flex-col p-4 space-y-4">
        {buttonsToShow.map((button, index) => (
          <button
            key={index}
            className="w-full h-auto py-4 flex flex-col items-start text-left border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition duration-200"
            onClick={() => abrirModal(button)}          
            >
            <span className="text-lg font-semibold pl-2">{'[' + button.orden_visita+ ']' + ' ' + button.nombre}</span>
            <span className="text-sm text-gray-600 pl-2">{button.Direccion.calle + ' ' + button.Direccion.numero +' (' + button.CODCL + ')'  }</span>
          </button>
        ))}
      </main>

      {/* Modal superpuesto */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full">
            <h2 className="text-2xl font-bold text-center mb-4">Opciones</h2>
            <div className="grid grid-cols-7 gap-4">
              {opciones.map((opcion, index) => (
                  <Link key={index} href={opcion.link} className="group">                  
                    <div className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 transition duration-200">
                      <opcion.icon className="h-12 w-12 text-primary group-hover:text-primary-dark transition-colors duration-200" />
                      <p className="mt-2 text-center text-sm font-medium">{opcion.name}</p>
                    </div>
                </Link>
              ))}
            </div>
            <button
              onClick={cerrarModal}
              className="mt-4 bg-gray-300 p-2 rounded-md hover:bg-gray-400 transition duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
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
            <button
            className="bg-gray-300 p-4 text-lg rounded-lg hover:bg-gray-400 transition duration-200 w-full flex items-center"
            onClick={logout}
          >
            <LogOut className="mr-4 h-6 w-6" />
            <span className="pl-2">Salir</span>
          </button>
        </div>
      </footer>

    </div>
  );
}
