"use client";

import React from "react";

export default function LoadDataScreen() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-10 rounded shadow-md w-128"> {/* Ajusta el ancho aquí */}
                {/* <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Cargar Información</h2> */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Columna de Carga de Datos */}
                    <div className="space-y-4">
                        {/* Día */}
                        <div>
                            <select
                                name="dia"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                            >
                                <option value="" disabled selected hidden>Dia</option>
                                <option value="lunes">Lunes</option>
                                <option value="martes">Martes</option>
                                <option value="miércoles">Miércoles</option>
                                <option value="jueves">Jueves</option>
                                <option value="viernes">Viernes</option>
                                <option value="sábado">Sábado</option>
                                <option value="domingo">Domingo</option>
                            </select>
                        </div>

                        {/* Ruta */}
                        <div>
                            <select
                                name="ruta"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                            >
                                <option value="" disabled selected hidden>Ruta</option>
                                <option value="ruta1">Ruta 1</option>
                                <option value="ruta2">Ruta 2</option>
                                <option value="ruta3">Ruta 3</option>
                            </select>
                        </div>

                        {/* Ascendente */}
                        <div>
                            <select
                                name="ascendente"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                            >
                                <option value="" disabled selected hidden>Ascendente</option>
                                <option value="ascendente1">Ascendente 1</option>
                                <option value="ascendente2">Ascendente 2</option>
                            </select>
                        </div>

                        {/* Orden */}
                        <div>
                            <select
                                name="orden"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                            >
                                <option value="" disabled selected hidden>Orden | Direccion | Nombre</option>
                                <option value="orden1">Orden 1</option>
                                <option value="orden2">Orden 2</option>
                            </select>
                        </div>

                        {/* Nombre */}
                        <div>
                            <select
                                name="nombre"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                            >
                                <option value="" disabled selected hidden>Ruta de visita</option>
                                <option value="nombre1">Nombre 1</option>
                                <option value="nombre2">Nombre 2</option>
                            </select>
                        </div>
                    </div>

                    {/* Columna de Frecuencia */}
                    <div>
                        <div className="space-y-2">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="frecuencia"
                                    value="quincenal"
                                    className="mr-2 appearance-none h-6 w-6 border border-gray-300 rounded-full checked:bg-blue-600 checked:border-transparent focus:outline-none"
                                />
                                Quincenal
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="frecuencia"
                                    value="cada_24_hs"
                                    className="mr-2 appearance-none h-6 w-6 border border-gray-300 rounded-full checked:bg-blue-600 checked:border-transparent focus:outline-none"
                                />
                                Cada 24 hs
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="frecuencia"
                                    value="semanal"
                                    className="mr-2 appearance-none h-6 w-6 border border-gray-300 rounded-full checked:bg-blue-600 checked:border-transparent focus:outline-none"
                                />
                                Semanal
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="frecuencia"
                                    value="cada_48_hs"
                                    className="mr-2 appearance-none h-6 w-6 border border-gray-300 rounded-full checked:bg-blue-600 checked:border-transparent focus:outline-none"
                                />
                                Cada 48 hs
                            </label>
                        </div>
                    </div>
                </div>

                {/* Botón de Envío */}
                <button
                    type="submit"
                    className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
                >
                    Cargar Datos
                </button>
            </div>
        </div>
    );
}
