"use client";

import React, { useEffect } from "react";
import { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Menu, MoreHorizontal, LogOut,
  Clipboard, Tag, MapPin, DollarSign, FileText, RefreshCw, Map, X,
  Wallet, ShoppingCart, ClipboardList
} from 'lucide-react';
import { Cliente } from "../crearruta/page";
import { setUpDataBase } from "@/lib/indexedDB";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useCarrito } from "@/lib/carritoContext";
import { logout } from "@/lib/auth";

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

  const tieneDeudas = (cliente : Cliente) => {
      return Array.isArray((cliente as any).deudas) && (cliente as any).deudas.length > 0;
  }

export default function RutaVisita() {
  const [clienteInfo,setClienteInfo] = useState<Cliente[]>([]);
  const [pagina_actual, setpagina_actual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [clientesConPedido, setClientesConPedido] = useState<Set<number>>(new Set());
  const [clientesSincronizados, setClientesSincronizados] = useState<Set<number>>(() => {
    // Cargar desde sessionStorage al iniciar
    if (typeof window !== 'undefined') {
      const guardados = sessionStorage.getItem('clientesSincronizados');
      if (guardados) {
        try {
          const array = JSON.parse(guardados);
          return new Set(array);
        } catch {
          return new Set();
        }
      }
    }
    return new Set();
  });
  const [clientesConError, setClientesConError] = useState<Set<number>>(() => {
    // Cargar desde sessionStorage al iniciar
    if (typeof window !== 'undefined') {
      const guardados = sessionStorage.getItem('clientesConError');
      if (guardados) {
        try {
          const array = JSON.parse(guardados);
          return new Set(array);
        } catch {
          return new Set();
        }
      }
    }
    return new Set();
  });
  const { carrito, obtenerItemsPorCliente, sincronizarTodo, eliminarItem } = useCarrito();
const totalPages = React.useMemo(() => {
  return Math.max(
    1,
    Math.ceil(clienteInfo.length / botones_por_pagina)
  );
}, [clienteInfo]);
  const buttonsToShow = React.useMemo(() => {
  const start = (pagina_actual - 1) * botones_por_pagina;
  return clienteInfo.slice(start, start + botones_por_pagina);
}, [clienteInfo, pagina_actual]);

  const router = useRouter()
  const [mounted, setMounted] = useState(false);


const sigPag = () => {
  setpagina_actual(prev => {
    const paginas = Math.max(1, Math.ceil(clienteInfo.length / botones_por_pagina));
    return Math.min(prev + 1, paginas);
  });
};

const antPag = () => {
  setpagina_actual(prev => Math.max(prev - 1, 1));
};

useEffect(() => {
  if (clienteInfo.length > 0) {
    setpagina_actual(1);
  }
}, [clienteInfo]);

useEffect(() => {
  // console.log({
  //   pagina_actual,
  //   totalPages,
  //   clientes: clienteInfo.length
  // });
}, [pagina_actual, clienteInfo]);



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
      await tx.done;  
  }

async function cargarClientesConPedido() {
  const db = await setUpDataBase();
  const tx = db.transaction("Pedido", "readonly");
  const store = tx.objectStore("Pedido");

  const pedidos = await store.getAll();
  await tx.done;

  const setClientesAnterior = new Set(clientesConPedido);
  const setClientes = new Set<number>();
  pedidos.forEach((p: any) => {
    if (p.clienteId) {
      setClientes.add(p.clienteId);
    }
  });

  // Detectar clientes que fueron sincronizados (estaban en la lista anterior pero ya no)
  // Solo si había clientes antes (para evitar falsos positivos al cargar la primera vez)
  if (setClientesAnterior.size > 0) {
    const nuevosSincronizados = new Set<number>();
    setClientesAnterior.forEach(clienteId => {
      if (!setClientes.has(clienteId)) {
        nuevosSincronizados.add(clienteId);
      }
    });
    
    if (nuevosSincronizados.size > 0) {
      console.log('Clientes sincronizados detectados:', nuevosSincronizados);
      setClientesSincronizados(prev => {
        const nuevoSet = new Set([...prev, ...nuevosSincronizados]);
        // Guardar en sessionStorage
        sessionStorage.setItem('clientesSincronizados', JSON.stringify([...nuevoSet]));
        return nuevoSet;
      });
      // El color verde se mantiene permanentemente durante toda la sesión
    }
  }

  setClientesConPedido(setClientes);
}

useEffect(() => {
  setMounted(true)
}, []);

useEffect(() => {
  if (!mounted) return;
   if (sessionStorage.getItem('isLoggedIn') === 'false') {
      router.push('/'); // Redirige a CrearRuta
    }else{
      ClienteInfo();
      cargarClientesConPedido();
    }

}, [mounted]);

useEffect(() => {
  const interval = setInterval(() => {
    cargarClientesConPedido();
    // Recargar clientes con errores desde sessionStorage
    const errores = sessionStorage.getItem('clientesConError');
    if (errores) {
      try {
        const array = JSON.parse(errores);
        setClientesConError(new Set(array));
      } catch {}
    } else {
      setClientesConError(new Set());
    }
  }, 2000);
  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    cargarClientesConPedido();
    // Recargar clientes con errores desde sessionStorage
    const errores = sessionStorage.getItem('clientesConError');
    if (errores) {
      try {
        const array = JSON.parse(errores);
        setClientesConError(new Set(array));
      } catch {}
    } else {
      setClientesConError(new Set());
    }
  }, 2000);
  return () => clearInterval(interval);
}, []);

useEffect(() => {
  if (clienteInfo.length === 0) {
    setpagina_actual(1);
    return;
  }

  const nuevasPaginas = Math.ceil(clienteInfo.length / botones_por_pagina);

  setpagina_actual(prev =>
    prev > nuevasPaginas ? nuevasPaginas : prev
  );
}, [clienteInfo]);



  return (
    <div className="min-h-screen flex flex-col">
      {/* Título */}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-center text-black">Ruta de Visita</h1>
      </div>

      {/* Barra de botones principales */}
      <div className="px-4 py-3 bg-white border-b flex justify-between items-center gap-4">
        <button onClick={() => router.push('/menu')} className="flex-1 bg-gray-300 px-4 py-2 text-sm rounded-lg hover:bg-gray-400 transition duration-200 flex items-center justify-center">
          <Menu className="mr-2 h-5 w-5" />
          <span>Menú</span>
        </button>
        <button onClick={() => router.push('/resumen')} className="flex-1 bg-green-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-green-600 transition duration-200 flex items-center justify-center">
          <ClipboardList className="mr-2 h-5 w-5" />
          <span>Resumen</span>
        </button>
        <button onClick={() => setMostrarCarrito(true)} className="flex-1 bg-blue-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-600 transition duration-200 flex items-center justify-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          <span>Carrito</span>
        </button>
        <button onClick={logout} className="flex-1 bg-gray-300 px-4 py-2 text-sm rounded-lg hover:bg-gray-400 transition duration-200 flex items-center justify-center">
          <LogOut className="mr-2 h-5 w-5" />
          <span>Salir</span>
        </button>
      </div>

      {/* Header con paginación */}
      <header className="p-4 bg-primary text-primary-foreground">
        <div className="flex justify-between items-center">
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
  {buttonsToShow.map((button, index) => {
  const tienePedido = clientesConPedido.has(button.CODCL);
  const sincronizadoRecientemente = clientesSincronizados.has(button.CODCL);
  const tieneError = clientesConError.has(button.CODCL);

      return (
        <button
          key={index}
          onClick={() => abrirModal(button)}
          className={`
            relative w-full h-auto py-4 flex flex-col items-start text-left 
            border rounded-lg transition duration-200
            ${tienePedido
              ? "bg-pink-100 border-pink-400 hover:bg-pink-200"
              : tieneError
              ? "bg-yellow-100 border-yellow-400 hover:bg-yellow-200"
              : sincronizadoRecientemente
              ? "bg-green-100 border-green-400 hover:bg-green-200" 
              : "bg-white border-gray-300 hover:bg-gray-100"}
          `}
        >
          { tieneDeudas(button) && (
            <Wallet className="absolute top-2 right-2 h-6 w-6 text-red-500" />
          )}
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

      {/* Modal del Carrito */}
      {mostrarCarrito && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-6xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Carrito de Cambios ({carrito.length} items)</h2>
              <button
                onClick={() => setMostrarCarrito(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="min-h-[200px]">
              {carrito.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay cambios pendientes</p>
              ) : (
                <div className="space-y-6">
                  {Array.from(obtenerItemsPorCliente().entries()).map(([clienteId, items]) => {
                    const primerItem = items[0];
                    return (
                      <div key={clienteId} className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="text-lg font-semibold mb-3 text-blue-600">
                          {primerItem.cliente_nombre} (ID: {clienteId})
                        </h3>
                        <div className="space-y-2">
                          {items.map((item, idx) => (
                            <div key={idx} className="bg-white p-3 rounded border-l-4 border-blue-500 relative">
                              {/* Botón X para eliminar */}
                              <button
                                onClick={async () => {
                                  if (confirm('¿Eliminar este elemento del carrito?')) {
                                    await eliminarItem(item.id!);
                                  }
                                }}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-full p-1"
                                title="Eliminar del carrito"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              
                              {item.tipo === 'precio' && (
                                <div className="flex justify-between items-center pr-8">
                                  <div>
                                    <p className="font-medium">📝 Cambio de Precio</p>
                                    <p className="text-sm text-gray-600">{item.articulo_nombre}</p>
                                    <p className="text-sm">
                                      <span className="line-through text-red-500">${item.precio_anterior}</span>
                                      {' → '}
                                      <span className="text-green-600 font-semibold">${item.precio_nuevo}</span>
                                    </p>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(item.fecha_modificacion).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {item.tipo === 'pedido' && (
                                <div className="flex justify-between items-center pr-8">
                                  <div>
                                    <p className="font-medium">🛒 Pedido</p>
                                    <p className="text-sm text-gray-600">{item.items.length} artículos</p>
                                    <p className="text-sm font-semibold text-green-600">Total: ${item.total}</p>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(item.fecha).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {item.tipo === 'comprobante_pago' && (
                                <div className="flex justify-between items-center pr-8">
                                  <div>
                                    <p className="font-medium">💳 Comprobante de Pago</p>
                                    <p className="text-sm text-gray-600">{item.archivo_nombre}</p>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(item.fecha).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {item.tipo === 'registro_deuda' && (
                                <div className="flex justify-between items-center pr-8">
                                  <div>
                                    <p className="font-medium">📄 Registro de Deuda</p>
                                    <p className="text-sm text-gray-600">Información de deuda actualizada</p>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(item.fecha).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {item.tipo === 'ubicacion' && (
                                <div className="flex justify-between items-center pr-8">
                                  <div>
                                    <p className="font-medium">📍 Cambio de Ubicación</p>
                                    <p className="text-sm text-gray-600">
                                      Lat: {item.latitud_anterior.toFixed(6)} → {item.latitud_nueva.toFixed(6)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Lng: {item.longitud_anterior.toFixed(6)} → {item.longitud_nueva.toFixed(6)}
                                    </p>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(item.fecha).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {item.tipo === 'actualizacion_datos' && (
                                <div className="flex justify-between items-center pr-8">
                                  <div>
                                    <p className="font-medium">✏️ Actualización de Datos</p>
                                    <p className="text-sm text-gray-600">Información del cliente actualizada</p>
                                    {item.datos_anteriores.telefono !== item.datos_nuevos.telefono && (
                                      <p className="text-xs text-gray-500">
                                        Tel: {String(item.datos_anteriores.telefono)} → {String(item.datos_nuevos.telefono)}
                                      </p>
                                    )}
                                    {item.datos_anteriores.email !== item.datos_nuevos.email && (
                                      <p className="text-xs text-gray-500">
                                        Email: {String(item.datos_anteriores.email)} → {String(item.datos_nuevos.email)}
                                      </p>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(item.fecha).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setMostrarCarrito(false)}
                className="flex-1 bg-gray-300 p-2 rounded-md hover:bg-gray-400 transition duration-200"
              >
                Cerrar
              </button>
              {carrito.length > 0 && (
                <button
                  onClick={async () => {
                    await sincronizarTodo();
                    await cargarClientesConPedido();
                    setMostrarCarrito(false);
                  }}
                  className="flex-1 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
                >
                  Sincronizar Todo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
