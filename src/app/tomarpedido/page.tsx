"use client"

import React, { useState, useEffect } from 'react';
import { Menu, LogOut } from 'lucide-react';

// Simulated database of articles
const articleDatabase = [
    { id: '001', name: 'Artículo 001' },
    { id: '002', name: 'Artículo 002' },
    { id: '003', name: 'Artículo 003' },
    // ... more articles
]

interface Article {
    id: string
    name: string
    quantity: number
}

export default function TomarPedido() {
    const [articleInput, setArticleInput] = useState('')
    const [suggestions, setSuggestions] = useState<typeof articleDatabase>([])
    const [quantity, setQuantity] = useState('')
    const [comment, setComment] = useState('')
    const [selectedArticles, setSelectedArticles] = useState<Article[]>([])

    useEffect(() => {
        if (articleInput) {
            const filtered = articleDatabase.filter(article =>
                article.id.includes(articleInput) || article.name.toLowerCase().includes(articleInput.toLowerCase())
            )
            setSuggestions(filtered.slice(0, 5)) // Limit to 5 suggestions
        } else {
            setSuggestions([])
        }
    }, [articleInput])

    const handleAddArticle = () => {
        const articleToAdd = articleDatabase.find(article => article.id === articleInput)
        if (articleToAdd && quantity) {
            setSelectedArticles(prev => [
                ...prev,
                { ...articleToAdd, quantity: parseInt(quantity) }
            ])
            setArticleInput('')
            setQuantity('')
        }
    }

    const handleSelectArticle = (id: string) => {
        setArticleInput(id)
        setSuggestions([] // Oculta las sugerencias al seleccionar un artículo
        )
    }

    const handleCancel = () => {
        setSelectedArticles([]) // Limpia la lista de artículos seleccionados
    }

    return (
        <div className="max-w-md mx-auto p-4 space-y-4 text-lg"> {/* Aumentar el tamaño de la fuente aquí */}
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
                                        {article.id} - {article.name}
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
                <label htmlFor="comment" className="block font-medium text-gray-700">
                    Comentario General
                </label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ingrese un comentario general"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">Artículos Seleccionados</h3>
                <div className="h-48 w-full border border-gray-300 rounded-md overflow-y-auto">
                    <ul className="p-4 space-y-2">
                        {selectedArticles.map((article, index) => (
                            <li key={index} className="flex justify-between items-center">
                                <span>{article.id} - {article.name}</span>
                                <span className="font-medium">Cantidad: {article.quantity}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handleCancel}
                    className="w-3/4 bg-red-500 p-2 text-white rounded-md hover:bg-red-600 transition duration-200"
                >
                    Cancelar
                </button>
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
    )
}
