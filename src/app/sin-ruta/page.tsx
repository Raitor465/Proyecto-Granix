 'use client'
import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Menu, MoreHorizontal, LogOut, Clipboard
  , Tag, MapPin, DollarSign, FileText, RefreshCw, Map, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { setUpDataBase } from "@/lib/indexedDB";
import { Cliente } from "../crearruta/page";
import Link from 'next/link';
import { logout } from "../rutavisita/page";

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

const sinRuta: React.FC = () => {
  const router = useRouter();
  const [clienteInfo, setClienteInfo] = useState<Cliente[]>([]);
  const [pagina_actual, setpagina_actual] = useState(1);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);

  const cerrarModal = () => setMostrarModal(false);
 
  const startIndex = (pagina_actual - 1) * botones_por_pagina;
  const [clientesConPedido, setClientesConPedido] = useState<Set<number>>(new Set());
  const clientesFiltrados = clienteInfo.filter(cliente =>
    cliente.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
  );
    const totalPages = Math.max(1,Math.ceil(clientesFiltrados.length / botones_por_pagina))
    const buttonsToShow = clientesFiltrados.slice(startIndex, startIndex + botones_por_pagina);
  const antPag = () => setpagina_actual(prev => Math.max(prev - 1, 1));
  const sigPag = () => setpagina_actual(prev => Math.min(prev + 1, totalPages));

  async function ClienteInfo() {
    const db = await setUpDataBase();
    const tx = db.transaction('RutaDeNoVisita', 'readonly');
    const clientes = await tx.store.getAll();
    setClienteInfo(clientes);
    await tx.done;
  }

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

   async function cargarClientesConPedido() {
     const db = await setUpDataBase();
     const tx = db.transaction("Pedido", "readonly");
     const store = tx.objectStore("Pedido");
   
     const pedidos = await store.getAll();
     await tx.done;
   
     const setClientes = new Set<number>();
     pedidos.forEach((p: any) => {
       if (p.clienteId) {
         setClientes.add(p.clienteId);
       }
     });
   
     setClientesConPedido(setClientes);
   }

   useEffect(() =>{
      setpagina_actual(1)

   }, [filtroNombre])


  useEffect(() => {
     if (sessionStorage.getItem('isLoggedIn') === 'false') {
       router.push('/'); // Redirige a CrearRuta
     }else{
     ClienteInfo(); // Llama a la función para cargar los datos cuando el componente se monta
     }
   }, []);
 

 useEffect(() => {
   cargarClientesConPedido();
 }, [mostrarModal]); 

 useEffect(() => {
   const nuevasPaginas = Math.max(
     1,
     Math.ceil(clienteInfo.length / botones_por_pagina)
   );
 
   if (pagina_actual > nuevasPaginas) {
     setpagina_actual(nuevasPaginas);
   }
 }, [clienteInfo]);



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
  {buttonsToShow.map((button, index) => {
  const tienePedido = clientesConPedido.has(button.CODCL);

      return (
        <button
          key={index}
          onClick={() => abrirModal(button)}
          className={`
            w-full h-auto py-4 flex flex-col items-start text-left 
            border rounded-lg transition duration-200
            ${tienePedido 
              ? "bg-pink-100 border-pink-400 hover:bg-pink-200" 
              : "bg-white border-gray-300 hover:bg-gray-100"}
          `}
        >
          <span className="text-lg font-semibold pl-2">
            [{button.orden_visita}] {button.nombre}
          </span>
          <span className="text-sm text-gray-600 pl-2">
            {button.Direccion.calle} {button.Direccion.numero} ({button.CODCL})
          </span>
        </button>
      );
          })}
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
          <button onClick={() => router.push('/menu')} className="bg-gray-300 p-4 text-lg rounded-lg hover:bg-gray-400 transition duration-200 w-full flex items-center">
            <Menu className="mr-4 h-6 w-6" />
            <span className="pl-2">Menú</span>
          </button>
          <button className="bg-gray-300 p-4 text-lg rounded-lg hover:bg-gray-400 transition duration-200 w-full flex items-center">
            <MoreHorizontal className="mr-4 h-6 w-6" />
            <span className="pl-2">Más opciones</span>
          </button>
          <button  onClick={logout} className="bg-gray-300 p-4 text-lg rounded-lg hover:bg-gray-400 transition duration-200 w-full flex items-center">
            <LogOut className="mr-4 h-6 w-6" />
            <span className="pl-2">Salir</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default sinRuta;
