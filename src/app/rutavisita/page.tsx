"use client";

import React, { useEffect } from "react";
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Menu, MoreHorizontal, LogOut } from 'lucide-react';
import { RutaDeVisita } from "../crearruta/page";
import { setUpDataBase } from "@/lib/indexedDB";
import Link from 'next/link';


interface RouteButton {
  title: string;
  description: string;
}

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

const opciones = [
  { name: "Cargar Pedido", img: "/path-to-icons/cargar-pedido.png", link: "/tomarpedido" },
  { name: "Registrar Precios", img: "/path-to-icons/registrar-precios.png", link: "/registrarprecios" },
  { name: "Ubicar Cliente", img: "/path-to-icons/ubicar-cliente.png", link: "/ubicar-cliente" },//ACA FALTA HACER LA PAGINA
  { name: "Solicitud de Pago", img: "/path-to-icons/solicitud-pago.png", link: "/solicitud-pago" },//ACA FALTA HACER LA PAGINA
  { name: "Deuda Entidad", img: "/path-to-icons/deuda-entidad.png", link: "/deuda-entidad" },//ACA FALTA HACER LA PAGINA
  { name: "Actualizar Datos", img: "/path-to-icons/actualizar-datos.png", link: "/actualizar-datos" },//ACA FALTA HACER LA PAGINA
  { name: "Geocalizar", img: "/path-to-icons/geocalizar.png", link: "/geocalizar" },//ACA FALTA HACER LA PAGINA
];

export default function RutaVisita() {
  const [clienteInfo,setClienteInfo] = useState<RutaDeVisita[]>([]);
  const [pagina_actual, setpagina_actual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);

  const totalPages = Math.ceil(clienteInfo.length / botones_por_pagina);
  const startIndex = (pagina_actual - 1) * botones_por_pagina;
  const buttonsToShow = clienteInfo.slice(startIndex, startIndex + botones_por_pagina);
  


  const antPag = () => setpagina_actual(prev => Math.max(prev - 1, 1));
  const sigPag = () => setpagina_actual(prev => Math.min(prev + 1, totalPages));
  //const abrirModal = () => setMostrarModal(true);
  //const cerrarModal = () => setMostrarModal(false);


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

  // Función para abrir el modal y guardar CODCL
  const abrirModal = (CODCL: string) => {
    localStorage.setItem("clienteSeleccionado", CODCL); // Guarda el CODCL en localStorage
    console.log("CODCL guardado:", CODCL); // Log para verificar
    setMostrarModal(true); // Muestra el modal
  };
  const cerrarModal = () => setMostrarModal(false);
  


  return (
    <div className="min-h-screen flex flex-col">
      {/* Encabezado */}
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

      {/* Lista de clientes */}
      <main className="flex-grow flex flex-col p-4 space-y-4">
        {buttonsToShow.map((button, index) => (
          <button
            key={index}
            className="w-full h-auto py-4 flex flex-col items-start text-left border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition duration-200"
            onClick={() => abrirModal(String(button.CODCL))} // Pasa CODCL al modal
          >
            <span className="text-lg font-semibold pl-2">
              {"[" + button.orden_visita + "] " + button.nombre}
            </span>
            <span className="text-sm text-gray-600 pl-2">
              {button.Direccion.calle +
                " " +
                button.Direccion.numero +
                " (" +
                button.CODCL +
                ")"}
            </span>
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
                <Link key={index} href={opcion.link}>
                  <div className="flex flex-col items-center cursor-pointer">
                    <img
                      src={opcion.img}
                      alt={`IMAGEN ${opcion.name}`}
                      className="h-16 w-16"
                    />
                    <p>{opcion.name}</p>
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
    </div>
  );
}
