// src/app/solicitudpago/page.tsx
"use client"

import { useState, ChangeEvent, useEffect } from 'react'
import { Deuda } from "../deuda/page";
import { Cliente } from "../crearruta/page";
import { setUpDataBase } from "@/lib/indexedDB"; 
import { LogOut } from 'lucide-react';

/* type Factura = {
  id: number
  numero: string
  importe: number
  fechaVencimiento: string
} */

export default function SolicitudPago() {
  /* const [facturas] = useState<Factura[]>([
    { id: 1, numero: "F001", importe: 1500.00, fechaVencimiento: "2023-07-15" },
    { id: 2, numero: "F002", importe: 2300.50, fechaVencimiento: "2023-07-20" },
    { id: 3, numero: "F003", importe: 800.75, fechaVencimiento: "2023-07-25" },
  ]) */
  const[deudas, setDeudas] = useState<Deuda[]>([])
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
  const [selectedFactura, setSelectedFactura] = useState<Deuda | null>(null)
  const [comentario, setComentario] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)

  const handleFacturaSelect = (factura: Deuda) => {
    setSelectedFactura(factura)
  }

  const handleComentarioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setComentario(e.target.value)
  }
  const handleArchivoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0])
    }
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar la solicitud de pago
    console.log('Solicitud enviada:', { selectedFactura, comentario, archivo })
  }

  // Función para manejar la navegación a otra página (ruta de visita)
  const handleNavigation = () => {
    window.location.href = "/rutavisita"; // Redirige al usuario a la ruta de visita
  };

  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Solicitud de Pago</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Facturas Disponibles</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deudas.map((factura) => (
            <div
              key={factura.operacion}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedFactura?.operacion === factura.operacion ? 'bg-blue-100 border-blue-500' : 'bg-white'
              }`}
              onClick={() => handleFacturaSelect(factura)}
            >
              <p className="font-bold">Número: {factura.operacion}</p>
              <p>Importe: ${factura.importe.toFixed(2)}</p>
              <p>Vencimiento: {factura.fechaVencimiento}</p>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="numeroOperacion" className="block mb-1 font-medium">
            Número de Operación
          </label>
          <input
            type="text"
            id="numeroOperacion"
            value={selectedFactura ? selectedFactura.operacion : ''}
            readOnly
            className="w-full p-2 border rounded-md bg-gray-100"
          />
        </div>
        <div>
          <label htmlFor="comentario" className="block mb-1 font-medium">
            Comentario (opcional)
          </label>
          <textarea
            id="comentario"
            value={comentario}
            onChange={handleComentarioChange}
            className="w-full p-2 border rounded-md"
            rows={3}
          ></textarea>
        </div>
        <div className="flex justify-between items-center">
        <button
          onClick={handleNavigation}
          className="bg-gray-300 p-3 text-sm rounded-lg hover:bg-gray-400 transition duration-200 flex items-center"
        >
          <LogOut className="mr-2 h-5 w-5" />
          <span className="pl-1">Volver</span>
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Enviar Solicitud
        </button>
      </div>
      </form>
    </div>
  )
}