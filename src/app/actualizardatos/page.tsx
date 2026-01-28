"use client";

import { setUpDataBase } from "@/lib/indexedDB";
import { Cliente } from "../crearruta/page";
import { useState, useEffect } from "react";
import {
  LogOut,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Truck,
  Hash,
  Save,
} from "lucide-react";

export default function ActualizarDatos() {
  const [cliente, setCliente] = useState<Cliente | null>(null);

  async function ClienteInfo() {
    const db = await setUpDataBase();
    const tx = db.transaction("ClienteSucursal", "readonly");
    const clientes = (await tx.store.getAll()) as Cliente[];
    setCliente(clientes[0]);
    await tx.done;
  }

  useEffect(() => {
    ClienteInfo();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCliente((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos actualizados:", cliente);
    // acá después conectás el guardado real
  };

  const handleNavigation = () => {
    window.location.href = "/rutavisita";
  };

  if (!cliente) {
    return <div className="p-4">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-6">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{cliente.nombre}</h1>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {cliente.Direccion.calle} {cliente.Direccion.numero}
            </p>
          </div>
        </div>
      </header>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-4 pb-28">
        {/* Orden visita */}
        <div className="bg-white border rounded-xl p-4">
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Hash className="h-4 w-4 text-blue-600" />
            Orden de visita
          </label>
          <input
            type="number"
            name="orden_visita"
            value={cliente.orden_visita}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Teléfono */}
        <div className="bg-white border rounded-xl p-4">
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Phone className="h-4 w-4 text-blue-600" />
            Teléfono
          </label>
          <input
            type="tel"
            name="telefono"
            value={cliente.telefono}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Email */}
        <div className="bg-white border rounded-xl p-4">
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Mail className="h-4 w-4 text-blue-600" />
            Email
          </label>
          <input
            type="email"
            name="email"
            value={cliente.email}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Notas */}
        <div className="bg-white border rounded-xl p-4">
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <FileText className="h-4 w-4 text-blue-600" />
            Notas
          </label>
          <textarea
            name="notas"
            value={cliente.notas}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
        </div>

        {/* Observaciones entrega */}
        <div className="bg-white border rounded-xl p-4">
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Truck className="h-4 w-4 text-blue-600" />
            Entrega (observaciones)
          </label>
          <textarea
            name="entrega_observaciones"
            value={cliente.entrega_observaciones}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
        </div>
      </form>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleNavigation}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
          >
            <LogOut className="h-4 w-4" />
            Volver
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            Actualizar datos
          </button>
        </div>
      </footer>
    </div>
  );
}
