"use client";

import React, { useState, useEffect } from 'react';
import {setUpDataBase, eliminarBaseDeDatosCompleta} from '../../lib/indexedDB'
import { supabase } from '@/lib/supabase';
import { useVendedor } from '@/lib/vendedorContext';
import { useRouter } from 'next/navigation';


// interface Zona {
//     zona_id: number;
//     nombre: string;
// }



interface RutaDeVisita {
    id : number,
    nombre : string,
    orden_visita : number,
    Direccion : {calle : string, numero : number}
    RutaDeVisita : {nombre : string}    
}


export const CrearRuta: React.FC = () => {

    const [rutaInfo, setRutaInfo] = useState<RutaDeVisita[]>([]); 
    const [sortOrder , setSortOrder] = useState('asc');
    const router = useRouter();

    async function RutaVisitaInfo() {

        const db = await setUpDataBase();
        const tx = db.transaction('RutaDeVisita','readonly');
        const rutas = await tx.store.getAll();
        setRutaInfo(rutas)
        tx.done;
    }
    useEffect(() => {
        RutaVisitaInfo(); // Llama a la función para cargar los datos cuando el componente se monta
    }, []);


    const handleSortOrderChange = (event: { target: { value: string; }; }) => {
        setSortOrder(event.target.value);
    }

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        // const queryParams= new URLSearchParams({sortOrder}).toString();

        // router.push(`/rutavisita?${queryParams}`);
        const db = await setUpDataBase();
        const tx = db.transaction('RutaDeVisita','write');
        const rutasFiltradas = await tx.store.getAll();
        tx.done;


    };

    useEffect(() => {
        if (rutaInfo !== null) {
            console.log("Datos de RutaInfo:", rutaInfo); // Registra los datos una vez que se actualizan
        }
    }, [rutaInfo]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-10 rounded shadow-md w-128">
                <div className="grid grid-cols-2 gap-4">
                    {/* Columna de Carga de Datos */}
                    <div className="space-y-4">
                        {/* Día */}
                        {/* <div> */}
                            {/* <select
                                name="dia"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                defaultValue=""
                            > */}
                                {/* {RutaInfo.map((ruta) => (
                                <option key={ruta.dia} label={ruta.dia}></option>
                            ))} */}
                            {/* </select> */}
                        {/* </div> */}

                        {/* Ruta */}
                        <div>
                            {/* <select
                                name="ruta"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                defaultValue=""
                            > */}
                                {/* <option value="" disabled hidden>Ruta</option>
                                <option value="ruta1">Ruta 1</option>
                                <option value="ruta2">Ruta 2</option>
                                <option value="ruta3">Ruta 3</option> */}
                                {/* {RutaInfo.map((ruta) => {
                                // Verifica si Zona es un arreglo, si no, conviértelo en un arreglo
                                const zonas = Array.isArray(ruta.Zona) ? ruta.Zona : [ruta.Zona]; // Conviértelo a un arreglo

                                return zonas.map((zona) => (
                                    <option key={zona.zona_id} value={zona.zona_id}>
                                        {zona.nombre}
                                    </option>
                                )); */}
                            {/* })} */}
                            {/* </select> */}

                            <select
                                name="ruta"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                defaultValue=""
                            >
                                <option value="" disabled hidden>Seleccione una ruta</option>
                                {rutaInfo.map((ruta) => (
                                    <option key={ruta.id} value={ruta.id}>
                                        {ruta.RutaDeVisita.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Ascendente */}
                        <div>
                            <select
                                name="orden"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                value= {sortOrder} onChange={handleSortOrderChange}
                            >
                                <option value="asc">Ascendente</option>
                                <option value="desc">Descendente</option>
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
                                <option value="" disabled hidden> Orden | Direccion | Nombre</option>
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
