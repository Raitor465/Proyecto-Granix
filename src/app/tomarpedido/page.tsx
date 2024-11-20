"use client"

import React, { useState, useEffect } from 'react';
import { Cliente } from "../crearruta/page";
import { setUpDataBase } from "@/lib/indexedDB"; 

// Simulated database of articles
const articleDatabase = [
    { id: "001", name: "Artículo 001", prices: { red: 100, yellow: 90, green: 80 } },
    { id: "002", name: "Artículo 002", prices: { red: 200, yellow: 180, green: 160 } },
    { id: "003", name: "Artículo 003", prices: { red: 300, yellow: 270, green: 240 } },
];

const bonusDatabase: {
    [key: string]: string[];  // Permite usar cualquier clave de tipo string
} = {
    "Agregar Bon. item": ["Item 1", "Item 2", "Item 3"],
    "Agregar Bon. S/Cargo": ["Sin Cargo 1", "Sin Cargo 2"],
    "Agregar Bon. General": ["General 1", "General 2", "General 3"],
    "Agregar Bon. Rotura": ["Rotura 1", "Rotura 2"],
};

/*
Agregar Bon. item
Agregar Bon. S/Cargo
Agregar Bon. General
Agregar Bon. Rotura

Opcion de ver de precios con iva y todo eso y un total de todo lo agregado
Opcion de sacar un articulo de la lista

Guardar el pedido



*/
interface Articulo {
  CODIM_art: number; // Código del artículo
  artic: number;     // Número de artículo
  id: number;        // Identificador único
  nombre: string;    // Nombre completo del artículo
  abrev: string;     // Abreviatura o descripción corta
  Precios: {
    prec_bult: number; // Precio por bulto
  };
}
interface ListaArt {
  nro_lista: number;
  nombre: string;
  articulosEnLista: Articulo[];
}

export default function TomarPedido() {
    const [articleInput, setArticleInput] = useState('');
    const [suggestions, setSuggestions] = useState<typeof articleDatabase>([]);
    const [quantity, setQuantity] = useState('');
    const [selectedArticles, setSelectedArticles] = useState<Articulo[]>([]);
    const [selectedClient, setSelectedClient] = useState("");
    const [selectedBonuses, setSelectedBonuses] = useState<Record<string, string>>({});
    const [totalPrice, setTotalPrice] = useState(0);

    async function ClienteInfo() {
      const db = await setUpDataBase();
      const tx = db.transaction('ClienteSucursal','readonly');
      const clientes = await tx.store.getAll() as Cliente[];
      const listaCliente = clientes[0].lista;
      // setDeudas(deudasCliente)
      const txArticulos = db.transaction('ListaArticulos', 'readonly');
      const listaArticulos = await txArticulos.store.getAll() as ListaArt[];
      const articulosFiltrados = listaArticulos.filter(articulo => articulo.nro_lista === listaCliente);
      tx.done;
      txArticulos.done;
  }
  useEffect(() => {
    ClienteInfo(); // Llama a la función para cargar los datos cuando el componente se monta
  }, []);
    useEffect(() => {
        if (articleInput) {
            const filtered = articleDatabase.filter(article =>
                article.id.includes(articleInput) || article.name.toLowerCase().includes(articleInput.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
        } else {
            setSuggestions([]);
        }
    }, [articleInput]);

    const handleAddArticle = () => {
        const articleToAdd = articleDatabase.find(article => article.id === articleInput);
        if (articleToAdd && quantity) {
            const newArticle = { ...articleToAdd, quantity: parseInt(quantity) };
            setSelectedArticles(prev => [...prev, newArticle]);
            setArticleInput('');
            setQuantity('');
        }
    };

    const handleSelectArticle = (id: string) => {
        setArticleInput(id);
        setSuggestions([]);
    };

    const handleBonusChange = (category: string, value: string) => {
        setSelectedBonuses((prev) => ({
            ...prev,
            [category]: value,
        }));
    };

    const calculateTotal = () => {
        let total = 0;
        selectedArticles.forEach(article => {
            const price = article.prices.red; // Example using 'red' price
            total += price * article.quantity;
        });
        // Add 21% IVA
        total = total * 1.21;
        setTotalPrice(total);
    };

    const handleRemoveArticle = (id: number) => {
        setSelectedArticles(prev => prev.filter(article => article.id !== id));
    };

    const handleCancel = () => {
        setSelectedArticles([]); // Clear selected articles
        setSelectedBonuses({});
        setTotalPrice(0);
    };

    return (
        <div className="max-w-md mx-auto p-4 space-y-4 text-lg">
            <div className="space-y-2">
                <label htmlFor="client" className="block font-medium text-gray-700">
                    Cliente
                </label>
                <select
                    id="client"
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                    <option value="">Seleccione un cliente</option>
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor="article" className="block font-medium text-gray-700">
                    Artículo
                </label>
                <div className="relative">
                    <input
                        id="article"
                        type="text"
                        value={articleInput}
                        onChange={(e) => setArticleInput(e.target.value)}
                        placeholder="Ingrese número de artículo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {suggestions.length > 0 && (
                        <div className="absolute z-10 w-full max-h-32 mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-y-auto">
                            <ul className="py-1">
                                {suggestions.map((article) => (
                                    <li
                                        key={article.id}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleSelectArticle(article.id)}
                                    >
                                        <div>
                                            <span>{article.id} - {article.name}</span>
                                            <div className="flex space-x-2 mt-1">
                                                <span className="text-red-500 font-bold">
                                                    {article.prices.red.toFixed(2)}
                                                </span>
                                                <span className="text-yellow-500 font-bold">
                                                    {article.prices.yellow.toFixed(2)}
                                                </span>
                                                <span className="text-green-500 font-bold">
                                                    {article.prices.green.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="quantity" className="block font-medium text-gray-700">
                    Bultos
                </label>
                <input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Ingrese cantidad de bultos"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>

            <button
                onClick={handleAddArticle}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
            >
                Agregar Artículo
            </button>

            <div className="space-y-2">
                {Object.keys(bonusDatabase).map((bonusType) => (
                    <div key={bonusType} className="space-y-2">
                        <label htmlFor={bonusType} className="block font-medium text-gray-700">
                            {bonusType}
                        </label>
                        <select
                            id={bonusType}
                            value={selectedBonuses[bonusType] || ''}
                            onChange={(e) => handleBonusChange(bonusType, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Seleccione una opción</option>
                            {bonusDatabase[bonusType].map((option, index) => (
                                <option key={index} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">Artículos Seleccionados</h3>
                <div className="h-48 w-full border border-gray-300 rounded-md overflow-y-auto">
                    <ul className="p-4 space-y-2">
                        {selectedArticles.map((article, index) => (
                            <li key={index} className="flex justify-between items-center">
                                <span>
                                    {article.id} - {article.name}
                                </span>
                                <span className="font-medium">
                                    Cantidad: {article.quantity}
                                </span>
                                <button
                                    onClick={() => handleRemoveArticle(article.id)}
                                    className="ml-2 text-red-500"
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={calculateTotal}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    Calcular Total
                </button>
                <span className="text-xl font-semibold">Total: ${totalPrice.toFixed(2)}</span>
            </div>

            <div className="space-x-4">
                <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                    Cancelar
                </button>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Confirmar Pedido
                </button>
            </div>
        </div>
    );
}