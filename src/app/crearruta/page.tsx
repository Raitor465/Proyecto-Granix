"use client";

import React, { useState, useEffect } from 'react';
import {setUpDataBase, eliminarBaseDeDatosCompleta} from '../../lib/indexedDB'
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export interface Cliente {
    id : number,
    CODCL : number,
    TPLIS : number,
    nombre : string,
    orden_visita : number,
    Direccion : {calle : string, numero : number, latitud : number , longitud : number}
    RutaDeVisita : {nombre : string, ruta_visita_id : number, dia : string}
    deudas: {
      tipo: string;
      operacion: number;
      importe: number;
      fechaVencimiento: string;
      filial: number;
      vendedor: number;
    }[];
    email: string;
    telefono: string;
    notas: string;
    entrega_observaciones: string;
    Bonificaciones: {Bon_general : string , BG_porc : number}
    BonificacionesEspeciales: {NOMBR: string , PBOND : number}
    PercepcionesIva: {PIVAANO : number}
}

interface RutaInfo{
  CODCL : number;
  nombre : string;
}

const arrayFrecuencias: never[] = [
]

const dias = [
  {name: "Lunes", id:1 },
  {name: "Martes", id:2 },
  {name: "Miercoles", id:3 },
  {name: "Jueves", id:4 },
  {name: "Viernes", id:5 },
  {name: "Todos las rutas", id:6 },
]

const CrearRuta: React.FC = () => {
  const [frecuenciaSeleccionada, setFrecuenciaSeleccionada] = useState<number[]>([]); // Cambiar de número a un array de números
  const [rutasFiltradas, setRutasFiltradas] = useState<Cliente[]>([]);
  const [rutaInfo, setRutaInfo] = useState<Cliente[]>([]);
  const [nombresRutas, setNombresRutas] = useState<RutaInfo[]>([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('diaSeleccionado') || null;
    }
    return null;
  });
  const [rutaSeleccionada, setRutaSeleccionada] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('rutaSeleccionada') || '';
    }
    return '';
  });
    const [sortOrder , setSortOrder] = useState('asc');
    const router = useRouter();

    async function RutaVisitaInfo() {


      const db = await setUpDataBase();
      const tx = db.transaction('RutaDeVisita','readonly');
      const rutas = await tx.store.getAll();
      setRutaInfo(rutas);
      setRutasFiltradas(rutas); // Mostrar todas inicialmente tx.done;


    }
    useEffect(() => {
        RutaVisitaInfo();
    }, []);
    
    // Restaurar selección de día al cargar
    useEffect(() => {
      if (rutaInfo.length > 0 && diaSeleccionado) {
        const rutasFiltradasActualizadas = rutaInfo.filter(
          (ruta) => ruta.RutaDeVisita.dia === diaSeleccionado
        );
        const nombresUnicos = Array.from(
          new Set(rutasFiltradasActualizadas.map((ruta: Cliente) => ruta.RutaDeVisita.nombre))
        ).map((nombre) => ({ CODCL: 0, nombre }));
        setNombresRutas(nombresUnicos as RutaInfo[]);
        setRutasFiltradas(rutasFiltradasActualizadas);
      }
    }, [rutaInfo]);


    const handleDiaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const diaId = event.target.value;
      if (diaId === "6") {
        setDiaSeleccionado(null); // Mostrar todas las rutas
        sessionStorage.removeItem('diaSeleccionado');
        setRutasFiltradas(rutaInfo);
        console.log(rutasFiltradas)
        const nombresUnicos = Array.from(
          new Set(rutaInfo.map((ruta: Cliente) => ruta.RutaDeVisita.nombre))
        ).map((nombre) => ({ CODCL: 0, nombre }));
        setNombresRutas(nombresUnicos as RutaInfo[]);
      } else {
        const dia = dias.find((d) => d.id.toString() === diaId)?.name || null;
        console.log(dia)
        setDiaSeleccionado(dia);
        if (dia) {
          sessionStorage.setItem('diaSeleccionado', dia);
        }


        const rutasFiltradasActualizadas = rutaInfo.filter(
          (ruta) => ruta.RutaDeVisita.dia === dia
        );
      
        const nombresUnicos = Array.from(
          new Set(rutasFiltradasActualizadas.map((ruta: Cliente) => ruta.RutaDeVisita.nombre))
        ).map((nombre) => ({ CODCL: 0, nombre }));
        setNombresRutas(nombresUnicos as RutaInfo[]);
        setRutasFiltradas(rutasFiltradasActualizadas);
      }
    };
    
    const handleRutaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const rutaNombre = event.target.value;
      setRutaSeleccionada(rutaNombre);
      if (rutaNombre) {
        sessionStorage.setItem('rutaSeleccionada', rutaNombre);
      } else {
        sessionStorage.removeItem('rutaSeleccionada');
      }
    };




    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const selectedRutaNombre = formData.get("ruta") as string;
        const sortOrder = formData.get("orden");
        //console.log(selectedRutaId,sortOrder)
        if (!selectedRutaNombre) {
            alert("Por favor, selecciona una ruta.");
            return;
        }

        // Filtrar por el nombre de la ruta seleccionada
        const rutasFiltradas = rutaInfo.filter(ruta => {
            return ruta.RutaDeVisita.nombre === selectedRutaNombre;
        });
        
        const rutasOrdenadas = rutasFiltradas.sort((a, b) =>
            sortOrder === "asc" ? a.orden_visita - b.orden_visita : b.orden_visita - a.orden_visita
          );

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
        
        // Eliminar las lista de precios que no estén dentro de los precios filtrados jaja.
        const txtx = db.transaction('Precios','readwrite');
        const storetx = txtx.store;
        const todasListasPrecios = await storetx.getAll();
        const tplisUsados = new Set(rutasOrdenadas.map((r) => r.TPLIS))

        for (const precio of todasListasPrecios){
          if (!tplisUsados.has(precio.TPLIS)){
            await storetx.delete(precio.TPLIS)
          }
        }
        await txtx.done;

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
                    name="dia"
                    required
                    onChange={handleDiaChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    value={diaSeleccionado ? dias.find(d => d.name === diaSeleccionado)?.id.toString() || '' : ''}
                  >
                    <option value="" disabled hidden>
                      Día
                    </option>
                    {dias.map((dia) => (
                      <option key={dia.id} value={dia.id}>
                        {dia.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    name="ruta"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    value={rutaSeleccionada}
                    onChange={handleRutaChange}
                  >
                    <option value="" disabled hidden>
                      Seleccione una ruta
                    </option>
                    {nombresRutas.map((ruta) => (
                      <option key={ruta.nombre} value={ruta.nombre}>
                        {ruta.nombre}
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
                      <div>
                            <select
                                name="orden"
                                
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
                                
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                defaultValue=""                            >
                                <option value="" disabled hidden>Ruta de visita 2.0</option>
                            </select>
                        </div>



              </div>
              {/* <div>

        <div className="space-y-2">
          {arrayFrecuencias.map((frec, index) => (
            <label key={index} className="flex items-center cursor-default ">
              <input
                type="checkbox"
                name="frecuencia"
                value={frec.name}
                disabled // Hace que el checkbox sea de solo lectura
                checked={frecuenciaSeleccionada.includes(frec.id)}
                className="mr-2 appearance-none h-6 w-6 border border-gray-300 rounded-full checked:bg-blue-600 checked:border-transparent focus:outline-none"
              />
              {frec.name}
            </label>
          ))}
        </div>
    </div> */}
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
