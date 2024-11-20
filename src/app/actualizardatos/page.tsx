// src/app/actualizardatos/page.tsx
"use client";

import { setUpDataBase } from "@/lib/indexedDB";
import { Cliente } from "../crearruta/page";
import { useState, useEffect } from "react";
import { LogOut } from 'lucide-react';

export default function ActualizarDatos() {
  const [cliente, setCliente] = useState<Cliente | null>(null);

  async function ClienteInfo() {
    const db = await setUpDataBase();
    const tx = db.transaction("ClienteSucursal", "readonly");
    const clientes = (await tx.store.getAll()) as Cliente[];
    const clienteSeleccionado = clientes[0];
    setCliente(clienteSeleccionado);
    console.log(clienteSeleccionado);
    tx.done;
  }

  useEffect(() => {
    ClienteInfo();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCliente((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos actualizados:", cliente);
    // Aquí iría la lógica para guardar los datos actualizados
  };

  if (!cliente) return <div>Cargando...</div>;


  // Función para manejar la navegación a otra página (ruta de visita)
  const handleNavigation = () => {
    window.location.href = "/rutavisita"; // Redirige al usuario a la ruta de visita
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{cliente.nombre}</h1>
      <p className="text-gray-600 mb-6">{`${cliente.Direccion.calle} ${cliente.Direccion.numero}`}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="orden_visita" className="block mb-1 font-medium">
            Orden de visita
          </label>
          <input
            type="number"
            id="orden_visita"
            name="orden_visita"
            value={cliente.orden_visita}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="telefono" className="block mb-1 font-medium">
            Teléfono
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={cliente.telefono}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="notas" className="block mb-1 font-medium">
            Notas
          </label>
          <textarea
            id="notas"
            name="notas"
            value={cliente.notas}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            rows={3}
          ></textarea>
        </div>

        <div>
          <label htmlFor="entrega_observaciones" className="block mb-1 font-medium">
            Entrega (observaciones)
          </label>
          <textarea
            id="entrega_observaciones"
            name="entrega_observaciones"
            value={cliente.entrega_observaciones}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            rows={3}
          ></textarea>
        </div>

        <div>
          <label htmlFor="email" className="block mb-1 font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={cliente.email}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Actualizar Datos
        </button>
      </form>
      <footer className="p-4 bg-muted">
                <div className="flex justify-between">
                <button onClick={handleNavigation} className="bg-gray-300 p-3 text-sm rounded-lg hover:bg-gray-400 transition duration-200 flex items-center">
                        <LogOut onClick={handleNavigation} className="mr-2 h-5 w-5" />
                        <span className="pl-1">Volver</span>
                    </button>
                </div>
            </footer>
    </div>
  );
}