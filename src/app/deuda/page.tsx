// src/app/deuda/page.tsx
"use client"
import { useState, useEffect } from 'react'
import { Cliente } from "../crearruta/page";
import { LogOut } from 'lucide-react';
import { setUpDataBase } from "@/lib/indexedDB"; 


// Definimos el tipo para los datos de deuda
export type Deuda = {
  tipo: string
  operacion: number
  importe: number
  fechaVencimiento: string
  filial: number
  vendedor: number
}

// Componente principal
export default function Component() {
  const[deudas, setDeudas] = useState<Deuda[]>([])
  // Función para manejar la navegación a otra página (ruta de visita)
  const handleNavigation = () => {
    window.location.href = "/rutavisita"; // Redirige al usuario a la ruta de visita
  };
  async function ClienteInfo() {
    const db = await setUpDataBase();
    const tx = db.transaction('ClienteSucursal','readonly');
    const clientes = await tx.store.getAll() as Cliente[];
    const deudasCliente = clientes[0].deudas;
    setDeudas(deudasCliente)
    tx.done;
}
useEffect(() => {
  ClienteInfo(); // Llama a la función para cargar los datos cuando el componente se monta
}, []);
  // Calcular el total de la deuda
  const totalDeuda = deudas.reduce((total, deuda) => total + deuda.importe, 0)

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2">Deuda del Cliente</h2>
        <p className="text-xl">Total: <span className="font-bold">${totalDeuda.toFixed(2)}</span></p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Tipo</th>
              <th className="py-2 px-4 border-b text-left">Operación</th>
              <th className="py-2 px-4 border-b text-left">Importe</th>
              <th className="py-2 px-4 border-b text-left">Fecha de Vencimiento</th>
              <th className="py-2 px-4 border-b text-left">Filial</th>
              <th className="py-2 px-4 border-b text-left">Vendedor</th>
            </tr>
          </thead>
          <tbody>
            {deudas.map((deuda, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-2 px-4 border-b">{deuda.tipo}</td>
                <td className="py-2 px-4 border-b">{deuda.operacion}</td>
                <td className="py-2 px-4 border-b">${deuda.importe.toFixed(2)}</td>
                <td className="py-2 px-4 border-b">{deuda.fechaVencimiento}</td>
                <td className="py-2 px-4 border-b">{deuda.filial}</td>
                <td className="py-2 px-4 border-b">{deuda.vendedor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="p-4 bg-muted">
        <div className="flex justify-between">
          <button onClick={handleNavigation} className="bg-gray-300 p-3 text-sm rounded-lg hover:bg-gray-400 transition duration-200 flex items-center">
            <LogOut onClick={handleNavigation} className="mr-2 h-5 w-5" />
            <span className="pl-1">Volver</span>
          </button>
        </div>
      </footer>
    </div>
  )
}