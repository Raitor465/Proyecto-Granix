"use client";

import React, { useState, useEffect } from 'react';
import {setUpDataBase, eliminarBaseDeDatosCompleta} from '../../lib/indexedDB'
import { supabase } from '@/lib/supabase';
import { useVendedor } from '@/lib/vendedorContext';

interface Zona {
    zona_id: number;
    nombre: string;
}

interface RutaDeVisita {
    dia: string;
    Zona: Zona[]; // Cambiado a un arreglo de objetos Zona
}


export const CrearRuta: React.FC = () => {

    const [RutaInfo, setRutaInfo] = useState<RutaDeVisita[]>([]); 



    async function RutaVisitaInfo() {
        let { data, error } = await supabase
        .from('RutaDeVisita')
        .select(`
          dia,
          Zona (zona_id,nombre)
        `);
        
        if (error) {
            console.error("Error al obtener datos:", error);
        } else {
            setRutaInfo(data as RutaDeVisita[]); // Asegúrate de que data sea del tipo correcto
        }
    }
    useEffect(() => {
        RutaVisitaInfo(); // Llama a la función para cargar los datos cuando el componente se monta
    }, []);


    // const { vendedorId } = useVendedor(); // Asegúrate de que esto esté configurado en tu contexto.

    // useEffect(() => {
    //   // Puedes usar el vendedorId para cargar información relacionada o hacer solicitudes.
    //   if (vendedorId) {
    //     console.log('ID del vendedor:', vendedorId);
    //     // Lógica para cargar rutas o hacer algo relacionado con el vendedor.
    //   }
    // }, [vendedorId]);


    useEffect(() => {
        if (RutaInfo !== null) {
            console.log("Datos de RutaInfo:", RutaInfo); // Registra los datos una vez que se actualizan
        }
    }, [RutaInfo]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-10 rounded shadow-md w-128">
                <div className="grid grid-cols-2 gap-4">
                    {/* Columna de Carga de Datos */}
                    <div className="space-y-4">
                        {/* Día */}
                        <div>
                            <select
                                name="dia"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                defaultValue=""
                            >
                                {RutaInfo.map((ruta) => (
                                <option key={ruta.dia} label={ruta.dia}></option>
                            ))}
                            </select>
                        </div>

                        {/* Ruta */}
                        <div>
                            <select
                                name="ruta"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                defaultValue=""
                            >
                                {/* <option value="" disabled hidden>Ruta</option>
                                <option value="ruta1">Ruta 1</option>
                                <option value="ruta2">Ruta 2</option>
                                <option value="ruta3">Ruta 3</option> */}
                                {RutaInfo.map((ruta) => {
                                // Verifica si Zona es un arreglo, si no, conviértelo en un arreglo
                                const zonas = Array.isArray(ruta.Zona) ? ruta.Zona : [ruta.Zona]; // Conviértelo a un arreglo

                                return zonas.map((zona) => (
                                    <option key={zona.zona_id} value={zona.zona_id}>
                                        {zona.nombre}
                                    </option>
                                ));
                            })}
                            </select>
                        </div>

                        {/* Ascendente */}
                        <div>
                            <select
                                name="ascendente"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                defaultValue=""
                            >
                                <option value="1" disabled hidden>Ascendente</option>
                                <option value="2">Descendente</option>
                            </select>
                        </div>

                        {/* Orden */}
                        <div>
                            <select
                                name="orden"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                defaultValue=""
                            >
                                <option value="" disabled hidden>Orden | Direccion | Nombre</option>
                            </select>
                        </div>

                        {/* Nombre */}
                        <div>
                            <select
                                name="nombre"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                defaultValue=""
                            >
                                <option value="" disabled hidden>Ruta de visita 2.0</option>
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
export default CrearRuta;
