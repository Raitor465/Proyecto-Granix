"use client"

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';


/*
1. Ingresar el artículo
    - Buscar el artículo por ID o nombre
    - Mostrar sugerencias
    - Seleccionar un artículo de la lista
    - Ingresar la cantidad
    - Agregar el artículo al pedido

Guardar el pedido



*/

interface Precio {
    artic_pr: number;
    prec_bult: number;
  }
  
  interface Articulo {
    id: number;
    artic: number;
    nombre: string;
    abrev: string;
    CODIM_art: number;
    Precios: Precio;
  }


  export default function TomarPedido() {
    // Definición del estado para el cliente seleccionado
    const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
  
    // Estado para almacenar los artículos recuperados de la base de datos
    const [articulos, setArticulos] = useState<Articulo[]>([]);
  
    // Estado para manejar la búsqueda de artículos en el input
    const [busqueda, setBusqueda] = useState("");
  
    // Estado para manejar el artículo actualmente seleccionado
    const [articuloSeleccionado, setArticuloSeleccionado] = useState<Articulo | null>(null);
  



    // useEffect para recuperar el cliente seleccionado de localStorage y realizar la consulta de artículos con precios
    useEffect(() => {
      // Recupera el cliente seleccionado de localStorage (si existe)
      const CODCL = localStorage.getItem("clienteSeleccionado");
      setClienteSeleccionado(CODCL);
  
      // Llama a la función que consulta los artículos con sus precios
      fetchArticulosConPrecios();
    }, []); // Se ejecuta una sola vez cuando el componente se monta
  



    // Función para recuperar los artículos con sus precios desde la base de datos (Supabase)
    const fetchArticulosConPrecios = async () => {
      const { data, error } = await supabase
        .from("Articulos") // Consultamos la tabla "Articulos"
        .select(`* , Precios(*)`); // Seleccionamos todos los campos de "Articulos" y los precios relacionados en la tabla "Precios"
        //console.log(data);
      if (error) {
        console.error("Error al traer artículos:", error); // Si ocurre un error en la consulta, lo mostramos en la consola
        return;
      }
  
      // Tipamos los datos recibidos explícitamente como un array de Articulo
      setArticulos(data as Articulo[]);
    };
  
    // FUNCIONES --------------------------------------------------------------

    // Función para manejar el cambio en el campo de búsqueda de artículos
    const handleBusqueda = (event: React.ChangeEvent<HTMLInputElement>) => {
      setBusqueda(event.target.value); // Actualiza el valor de búsqueda
      setArticuloSeleccionado(null); // Limpiar la selección del artículo al cambiar la búsqueda
    };
  
    // Función para manejar la selección de un artículo en la lista
    const handleSeleccionArticulo = (articulo: Articulo) => {
        setArticuloSeleccionado(articulo); // Establece el artículo seleccionado
    
        // Agregar log para verificar los datos
        console.log(articulo.Precios); // Esto debería mostrar el arreglo de Precios
        
        // Verifica si el arreglo de Precios tiene al menos un elemento
        const precio = articulo.Precios && articulo.Precios.artic_pr > 0
            ? articulo.Precios.prec_bult // Accede al primer precio en el arreglo
            : "No disponible"; // Si no hay precios, muestra "No disponible"
        //console.log(precio)
        // Actualiza el campo de búsqueda con el nombre y precio del artículo seleccionado
        setBusqueda(`${articulo.artic} - ${articulo.abrev} - $${precio}`);
    };
  
    // Filtra los artículos en base al texto ingresado en el campo de búsqueda (case-insensitive)
    const articulosFiltrados = articulos.filter((articulo) =>
      articulo.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  
    // Función para manejar la navegación a otra página (ruta de visita)
    const handleNavigation = () => {
      window.location.href = "/rutavisita"; // Redirige al usuario a la ruta de visita
    };

    

    return (
    <div className="min-h-screen bg-white p-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Cargar Pedido</h1>
      </div>

      {/* Formulario superior */}
      <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg shadow-lg mb-8">
      <div>
        <label className="block text-gray-700 font-medium">Artículo</label>
        <input
            type="text"
            className="w-full border border-gray-300 rounded p-2 mt-1"
            placeholder="Ingrese el artículo"
            value={busqueda}
            onChange={handleBusqueda}
        />
        {/* Mostrar sugerencias de búsqueda */}
        {busqueda && (
            <ul className="mt-2 max-h-40 overflow-auto border border-gray-300 rounded-lg">
              {articulosFiltrados.map((articulo) => {
                const precio = articulo.Precios && articulo.Precios.artic_pr > 0
                ? articulo.Precios.prec_bult // Accede al primer precio en el arreglo
                : "No disponible";
                return (
                  <li
                    key={articulo.id}
                    className="p-2 border-b border-gray-200 cursor-pointer"
                    onClick={() => handleSeleccionArticulo(articulo)}
                  >
                    <span className="font-semibold">{articulo.nombre}</span> - ${precio}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Bultos</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded p-2 mt-1"
            placeholder="Ingrese cantidad"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Bon. General</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded p-2 mt-1"
            placeholder="Ingrese bonificación"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Sin disconformidad</label>
          <select className="w-full border border-gray-300 rounded p-2 mt-1">
            <option value="">Seleccionar</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Bon. Item</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded p-2 mt-1"
            placeholder="Ingrese bonificación"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Ingresar no compra</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded p-2 mt-1"
            placeholder="Ingrese texto"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Comentario</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded p-2 mt-1"
            placeholder="Ingrese comentario"
          />
        </div>
        <button className="bg-black text-white px-6 py-2 rounded-lg font-bold">
          Agregar
        </button>

      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300 text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Artículos</th>
              <th className="border border-gray-300 p-2">Cantidad</th>
              <th className="border border-gray-300 p-2">Sin Imp.</th>
              <th className="border border-gray-300 p-2">IVA</th>
              <th className="border border-gray-300 p-2">Sin Imp. + IVA</th>
            </tr>
          </thead>
          <tbody>
            {/* Filas vacías */}
            <tr>
              <td className="border border-gray-300 p-2"></td>
              <td className="border border-gray-300 p-2"></td>
              <td className="border border-gray-300 p-2"></td>
              <td className="border border-gray-300 p-2"></td>
              <td className="border border-gray-300 p-2"></td>
            </tr>
            {/* Fila total */}
            <tr className="bg-blue-100">
              <td className="border border-gray-300 p-2 font-bold">Total:</td>
              <td className="border border-gray-300 p-2"></td>
              <td className="border border-gray-300 p-2"></td>
              <td className="border border-gray-300 p-2"></td>
              <td className="border border-gray-300 p-2"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Botones */}
      <div className="flex justify-center gap-4 mt-8">
      <button onClick={handleNavigation} className="bg-black text-white px-6 py-2 rounded-lg font-bold">
          Volver
        </button>
        <button className="bg-black text-white px-6 py-2 rounded-lg font-bold">
          Cancelar
        </button>
        <button className="bg-black text-white px-6 py-2 rounded-lg font-bold">
          Terminar
        </button>
      </div>
    </div>
  );
};