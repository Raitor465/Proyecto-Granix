// src/app/deuda/page.tsx
"use client"
import { useState, useEffect } from 'react'
import { Cliente } from "../crearruta/page";
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
/*   const [deudas] = useState<Deuda[]>([
    { tipo: "Factura", operacion: 1001, importe: 1500.00, fechaVencimiento: "2023-07-15", filial: 1, vendedor: 101 },
    { tipo: "Factura", operacion: 1002, importe: 2300.50, fechaVencimiento: "2023-07-20", filial: 2, vendedor: 102 },
    { tipo: "Factura", operacion: 1003, importe: 800.75, fechaVencimiento: "2023-07-25", filial: 1, vendedor: 103 },
  ])
 */
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
    </div>
  )
}