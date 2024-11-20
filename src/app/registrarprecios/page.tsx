"use client";

import React, { useState, useEffect } from "react";
import { Menu, LogOut, Search, Save } from "lucide-react";
import { Cliente } from "../crearruta/page";
import { setUpDataBase } from "@/lib/indexedDB";

interface Articulo {
  CODIM_art: number;
  artic: number;
  id: number;
  nombre: string;
  abrev: string;
  Precios: {
    prec_bult: number;
  };
  Ivas: {
    porc: number;
  };
}

interface ListaArt {
  nro_lista: number;
  nombre: string;
  articulosEnLista: { Articulos: Articulo }[];
}

export default function RegistrarPrecio() {
  const [entradaBusqueda, setEntradaBusqueda] = useState("");
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [articulosFiltrados, setArticulosFiltrados] = useState<Articulo[]>([]);
  const [preciosEditables, setPreciosEditables] = useState<{
    [key: string]: string;
  }>({});
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  async function ClienteInfo() {
    const db = await setUpDataBase();
    const tx = db.transaction("ClienteSucursal", "readonly");
    const clientes = await tx.store.getAll() as Cliente[];
    const listaCliente = clientes[0].lista;

    setClienteSeleccionado(clientes[0]);

    const txArticulos = db.transaction("ListaArticulos", "readonly");
    const listaArticulos = await txArticulos.store.getAll() as ListaArt[];

    const articulosDeLista = listaArticulos.filter(
      (articulo) => articulo.nro_lista === listaCliente
    );

    const listaDeArticulos: Articulo[] = [];
    if (articulosDeLista.length > 0) {
      for (const item of articulosDeLista[0].articulosEnLista) {
        listaDeArticulos.push(item.Articulos);
      }
    }

    setArticulos(listaDeArticulos);
    tx.done;
    txArticulos.done;
  }

  useEffect(() => {
    ClienteInfo();
  }, []);

  useEffect(() => {
    const filtrados = articulos.filter(
      (articulo) =>
        articulo.id.toString().includes(entradaBusqueda) ||
        articulo.nombre.toLowerCase().includes(entradaBusqueda.toLowerCase())
    );
    setArticulosFiltrados(filtrados);
  }, [entradaBusqueda, articulos]);

  const manejarCambioPrecio = (id: number, valor: string) => {
    setPreciosEditables((prev) => ({ ...prev, [id]: valor }));
  };

  const manejarGuardarPrecio = (id: number) => {
    const nuevoPrecio = parseFloat(preciosEditables[id]);
    if (!isNaN(nuevoPrecio)) {
      const articuloIndex = articulos.findIndex((articulo) => articulo.id === id);
      if (articuloIndex !== -1) {
        const nuevosArticulos = [...articulos];
        nuevosArticulos[articuloIndex].Precios.prec_bult = nuevoPrecio;
        setArticulos(nuevosArticulos);
        console.log(`Guardando nuevo precio para el artículo ${id}: $${nuevoPrecio}`);
      }

      setPreciosEditables((prev) => {
        const nuevoEstado = { ...prev };
        delete nuevoEstado[id];
        return nuevoEstado;
      });
    }
  };
  const handleNavigation = () => {
    window.location.href = "/rutavisita"; // Redirige al usuario a la ruta de visita
  };
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 text-lg">
      <h1 className="text-2xl font-bold text-center mb-6">
        Lista de Precios - Cliente: {clienteSeleccionado?.nombre || "Cargando..."}
      </h1>

      <div className="relative">
        <input
          type="text"
          value={entradaBusqueda}
          onChange={(e) => setEntradaBusqueda(e.target.value)}
          placeholder="Buscar artículo por número o nombre"
          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      <div className="h-[calc(100vh-300px)] w-full border border-gray-200 rounded-md overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Precio</th>
              <th className="p-2 text-left">Acción</th>
            </tr>
          </thead>
          <tbody>
            {articulosFiltrados.map((articulo) => (
              <tr key={articulo.id} className="border-b border-gray-200">
                <td className="p-2">{articulo.id}</td>
                <td className="p-2">{articulo.nombre}</td>
                <td className="p-2">
                  {preciosEditables[articulo.id] !== undefined ? (
                    <input
                      type="number"
                      value={preciosEditables[articulo.id]}
                      onChange={(e) =>
                        manejarCambioPrecio(articulo.id, e.target.value)
                      }
                      className="w-24 px-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    `$${articulo.Precios.prec_bult.toFixed(2)}`
                  )}
                </td>
                <td className="p-2">
                  {preciosEditables[articulo.id] !== undefined ? (
                    <button
                      onClick={() => manejarGuardarPrecio(articulo.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-md"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        manejarCambioPrecio(
                          articulo.id,
                          articulo.Precios.prec_bult.toString()
                        )
                      }
                      className="px-4 py-2 border border-gray-300 rounded-md"
                    >
                      Editar
                    </button>
                  )}
                </td>
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
  );
}
