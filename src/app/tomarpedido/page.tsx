"use client"

import React, { useState, useEffect } from 'react';



/*
1. Ingresar el artículo
    - Buscar el artículo por ID o nombre
    - Mostrar sugerencias
    - Seleccionar un artículo de la lista
    - Ingresar la cantidad
    - Agregar el artículo al pedido

Guardar el pedido



*/
interface Article {
    id: string;
    name: string;
    prices: {
        red: number;
        yellow: number;
        green: number;
    };
    quantity: number;
}

export default function TomarPedido() {
    const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);

    useEffect(() => {
        // Recupera el valor almacenado en localStorage
        const CODCL = localStorage.getItem("clienteSeleccionado");
        setClienteSeleccionado(CODCL); // Actualiza el estado con el valor recuperado
        //console.log(CODCL);
      }, []);


    const calculateTotal = () => {
        
    };

    

    const handleNavigation = () => {
        window.location.href = "/rutavisita";
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
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Bon. Rotura</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded p-2 mt-1"
            placeholder="Ingrese bonificación"
          />
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
          <label className="block text-gray-700 font-medium">Comentario</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded p-2 mt-1"
            placeholder="Ingrese comentario"
          />
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
          <label className="block text-gray-700 font-medium">Sin disconformidad</label>
          <select className="w-full border border-gray-300 rounded p-2 mt-1">
            <option value="">Seleccionar</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Bon. S/Cargo</label>
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
              <th className="border border-gray-300 p-2">P. IVA</th>
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