// src/app/actualizardatos/page.tsx
"use client"

import { useState } from 'react'

type Cliente = {
  nombre: string
  direccion: string
  ordenVisita: number
  contacto: string
  telefono: string
  notas: string
  entrega: string
  frecuencia: string
  diaVisita: string
  emails: string[]
}

export default function ActualizarDatos() {
  const [cliente, setCliente] = useState<Cliente>({
    nombre: "Juan Pérez",
    direccion: "Calle Principal 123, Ciudad",
    ordenVisita: 1,
    contacto: "Juan Pérez",
    telefono: "123-456-7890",
    notas: "",
    entrega: "",
    frecuencia: "Semanal",
    diaVisita: "Lunes",
    emails: ["juan@example.com"]
  })

  const [nuevoEmail, setNuevoEmail] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCliente(prev => ({ ...prev, [name]: value }))
  }

  const handleEmailAdd = () => {
    if (nuevoEmail && !cliente.emails.includes(nuevoEmail)) {
      setCliente(prev => ({ ...prev, emails: [...prev.emails, nuevoEmail] }))
      setNuevoEmail('')
    }
  }

  const handleEmailRemove = (email: string) => {
    setCliente(prev => ({ ...prev, emails: prev.emails.filter(e => e !== email) }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar los datos actualizados
    console.log('Datos actualizados:', cliente)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{cliente.nombre}</h1>
      <p className="text-gray-600 mb-6">{cliente.direccion}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ordenVisita" className="block mb-1 font-medium">
            Orden de visita
          </label>
          <input
            type="number"
            id="ordenVisita"
            name="ordenVisita"
            value={cliente.ordenVisita}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="contacto" className="block mb-1 font-medium">
            Contacto
          </label>
          <input
            type="text"
            id="contacto"
            name="contacto"
            value={cliente.contacto}
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
          <label htmlFor="entrega" className="block mb-1 font-medium">
            Entrega (observaciones)
          </label>
          <textarea
            id="entrega"
            name="entrega"
            value={cliente.entrega}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            rows={3}
          ></textarea>
        </div>

        <div>
          <label htmlFor="frecuencia" className="block mb-1 font-medium">
            Frecuencia
          </label>
          <select
            id="frecuencia"
            name="frecuencia"
            value={cliente.frecuencia}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="Diaria">Diaria</option>
            <option value="Semanal">Semanal</option>
            <option value="Quincenal">Quincenal</option>
            <option value="Mensual">Mensual</option>
          </select>
        </div>

        <div>
          <label htmlFor="diaVisita" className="block mb-1 font-medium">
            Día de visita
          </label>
          <select
            id="diaVisita"
            name="diaVisita"
            value={cliente.diaVisita}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="Lunes">Lunes</option>
            <option value="Martes">Martes</option>
            <option value="Miércoles">Miércoles</option>
            <option value="Jueves">Jueves</option>
            <option value="Viernes">Viernes</option>
            <option value="Sábado">Sábado</option>
            <option value="Domingo">Domingo</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Emails
          </label>
          {cliente.emails.map((email, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="email"
                value={email}
                readOnly
                className="flex-grow p-2 border rounded-md mr-2"
              />
              <button
                type="button"
                onClick={() => handleEmailRemove(email)}
                className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          ))}
          <div className="flex items-center">
            <input
              type="email"
              value={nuevoEmail}
              onChange={(e) => setNuevoEmail(e.target.value)}
              className="flex-grow p-2 border rounded-md mr-2"
              placeholder="Nuevo email"
            />
            <button
              type="button"
              onClick={handleEmailAdd}
              className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Añadir
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Actualizar Datos
        </button>
      </form>
    </div>
  )
}