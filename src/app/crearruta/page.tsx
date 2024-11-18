"use client";

import React, { useState, useEffect } from 'react';
import {setUpDataBase, eliminarBaseDeDatosCompleta} from '../../lib/indexedDB'
import { useRouter } from 'next/navigation';

export interface RutaDeVisita {
    id : number,
    CODCL : number,
    nombre : string,
    orden_visita : number,
    Direccion : {calle : string, numero : number}
    RutaDeVisita : {nombre : string, ruta_visita_id : number}    
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


    // const handleSortOrderChange = (event: React.FormEvent<HTMLFormElement>) => {
    //     setSortOrder(event.target.value);
    // }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const selectedRutaId = formData.get("ruta");
        const sortOrder = formData.get("orden");

        if (!selectedRutaId) {
            alert("Por favor, selecciona una ruta.");
            return;
        }

        const rutasFiltradas = rutaInfo.filter(ruta => {
            return ruta.RutaDeVisita.ruta_visita_id === Number(selectedRutaId);
        })
        const rutasOrdenadas = rutasFiltradas.sort((a, b) =>
            sortOrder === "asc" ? a.orden_visita - b.orden_visita : b.orden_visita - a.orden_visita
          );
        //console.log(rutasOrdenadas)

        // Obtener todas las rutas actuales
        // Actualizar la base de datos para eliminar las rutas que no pasaron el filtro
        const db = await setUpDataBase();
        const tx = db.transaction('RutaDeVisita', 'readwrite');
        const store = tx.store;
        const todasLasRutas = await store.getAll();

        // Identificar las rutas a eliminar (no están en rutasOrdenadas)
        const idsParaEliminar = todasLasRutas
            .filter((ruta: { id: number; }) => !rutasOrdenadas.some(r => r.id === ruta.id))
            .map((ruta: { id: any; }) => ruta.id);

        // Eliminar las rutas no deseadas
        for (const id of idsParaEliminar) {
            await store.delete(id);
        }

        await tx.done;

        router.push(`/rutavisita`);
    };

    useEffect(() => {
        if (rutaInfo !== null) {
            console.log("Datos de RutaInfo:", rutaInfo); // Registra los datos una vez que se actualizan
        }
    }, [rutaInfo]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-10 rounded shadow-md w-128">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <select
                    name="ruta"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    defaultValue=""
                  >
                    <option value="" disabled hidden>
                      Seleccione una ruta
                    </option>
                    {rutaInfo.map((ruta) => (
                      <option key={ruta.id} value={ruta.RutaDeVisita.ruta_visita_id}>
                        {ruta.RutaDeVisita.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    name="orden"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="asc">Ascendente</option>
                    <option value="desc">Descendente</option>
                  </select>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
            >
              Cargar Datos
            </button>
          </form>
        </div>
      </div>
    );
}
export default CrearRuta;
