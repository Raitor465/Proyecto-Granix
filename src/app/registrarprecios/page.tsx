// src/app/registrarprecios/page.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { Menu, LogOut, Search, Save } from 'lucide-react';

// Simulated database of articles with prices
const baseDeDatosArticulos = [
    { id: '001', nombre: 'Artículo 001', precio: 100 },
    { id: '002', nombre: 'Artículo 002', precio: 200 },
    { id: '003', nombre: 'Artículo 003', precio: 300 },
    { id: '004', nombre: 'Artículo 004', precio: 400 },
    { id: '005', nombre: 'Artículo 005', precio: 500 },
    // ... more articles
]

interface Articulo {
    id: string
    nombre: string
    precio: number
}

export default function RegistrarPrecio() {
    const [entradaBusqueda, setEntradaBusqueda] = useState('');
    const [articulosFiltrados, setArticulosFiltrados] = useState<Articulo[]>(baseDeDatosArticulos);
    const [preciosEditables, setPreciosEditables] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const filtrados = baseDeDatosArticulos.filter(articulo =>
            articulo.id.includes(entradaBusqueda) || articulo.nombre.toLowerCase().includes(entradaBusqueda.toLowerCase())
        );
        setArticulosFiltrados(filtrados);
    }, [entradaBusqueda]);

    const manejarCambioPrecio = (id: string, valor: string) => {
        setPreciosEditables(prev => ({ ...prev, [id]: valor }));
    };

    const manejarGuardarPrecio = (id: string) => {
        const nuevoPrecio = parseFloat(preciosEditables[id]);
        if (!isNaN(nuevoPrecio)) {
            // Actualizar el artículo en la base de datos
            const articuloIndex = baseDeDatosArticulos.findIndex(articulo => articulo.id === id);
            if (articuloIndex !== -1) {
                baseDeDatosArticulos[articuloIndex].precio = nuevoPrecio;
                console.log(`Guardando nuevo precio para el artículo ${id}: $${nuevoPrecio}`);
            }

            setPreciosEditables(prev => {
                const nuevoEstado = { ...prev };
                delete nuevoEstado[id];
                return nuevoEstado;
            });
            setArticulosFiltrados([...baseDeDatosArticulos]); // Actualiza la lista filtrada
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-4 text-lg">
            <h1 className="text-2xl font-bold text-center mb-6">Lista N° #</h1>

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
                                            onChange={(e) => manejarCambioPrecio(articulo.id, e.target.value)}
                                            className="w-24 px-2 border border-gray-300 rounded-md"
                                        />
                                    ) : (
                                        `$${articulo.precio.toFixed(2)}`
                                    )}
                                </td>
                                <td className="p-2">
                                    {preciosEditables[articulo.id] !== undefined ? (
                                        <button onClick={() => manejarGuardarPrecio(articulo.id)} className="px-4 py-2 bg-green-500 text-white rounded-md">
                                            <Save className="w-4 h-4 mr-2" />
                                            Guardar
                                        </button>
                                    ) : (
                                        <button onClick={() => manejarCambioPrecio(articulo.id, articulo.precio.toString())} className="px-4 py-2 border border-gray-300 rounded-md">
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
                    <button className="bg-gray-300 p-3 text-sm rounded-lg hover:bg-gray-400 transition duration-200 flex items-center">
                        <Menu className="mr-2 h-5 w-5" />
                        <span className="pl-1">Menú</span>
                    </button>
                    <button className="bg-gray-300 p-3 text-sm rounded-lg hover:bg-gray-400 transition duration-200 flex items-center">
                        <LogOut className="mr-2 h-5 w-5" />
                        <span className="pl-1">Salir</span>
                    </button>
                </div>
            </footer>
        </div>
    );
}
