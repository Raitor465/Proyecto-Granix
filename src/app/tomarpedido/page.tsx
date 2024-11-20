"use client"

import React, { useState, useEffect } from 'react';
import { Cliente } from '../crearruta/page';
import { supabase } from '@/lib/supabase';
import { Data } from '@react-google-maps/api';
import { setUpDataBase } from '@/lib/indexedDB';
import { AirVent } from 'lucide-react';

/* interface Precio {
    artic_pr: number;
    prec_bult: number;
  }
  
  interface Articulo {
    id: number;
    artic: number;
    nombre: string;
    abrev: string;
    CODIM_art: number;
    Precios: Precio;
    Ivas?: {
      porc: number; // El porcentaje de IVA asociado
    };
  }

  interface Bonificacion {
    BG_porc: number;  // Aquí definimos que BG_porc debe ser un número
  } */
interface Articulo {
    CODIM_art: number; // Código del artículo
    artic: number;     // Número de artículo
    id: number;        // Identificador único
    nombre: string;    // Nombre completo del artículo
    abrev: string;     // Abreviatura o descripción corta
    Precios: {
        prec_bult: number; // Precio por bulto
    };
    Ivas: {
        porc: number; // Porcentaje de IVA
    }
}
interface ListaArt {
    nro_lista: number;
    nombre: string;
    articulosEnLista: { Articulos: Articulo }[];
}

export default function TomarPedido() {
    // Definición del estado para el cliente seleccionado
    // const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

    // Estado para almacenar los artículos recuperados de la base de datos
    const [articulos, setArticulos] = useState<Articulo[]>([]);
    // const [bonificaciones, setBonificaciones] = useState<ClienteBonificacion>();
    // Estado para manejar la búsqueda de artículos en el input
    const [busqueda, setBusqueda] = useState("");

    // Estado para manejar el artículo actualmente seleccionado
    const [articuloSeleccionado, setArticuloSeleccionado] = useState<Articulo | null>(null);
    const [bonificacionGeneral, setBonificacionGeneral] = useState<number>(0);  // Corregido tipo a número
    const [carrito, setCarrito] = useState<{
        articulo: Articulo;
        cantidad: number;
        subtotal: number;
        iva: number;
        total: number;
    }[]>([]);
    const [cantidad, setCantidad] = useState<number | "">("");
    const [bonificacionItem, setBonificacionItem] = useState<number | "">(""); // Nuevo estado para la bonificación específica del artículo
    const [mensaje, setMensaje] = useState<string | null>(null); // Estado para mostrar mensaje de éxito/error



    async function ClienteInfo() {
        const db = await setUpDataBase();
        const tx = db.transaction('ClienteSucursal', 'readonly');
        const clientes = await tx.store.getAll() as Cliente[];
        const listaCliente = clientes[0].lista;
        // setDeudas(deudasCliente)
        setClienteSeleccionado(clientes[0]);
        // console.log(clientes[0]);
        const txArticulos = db.transaction('ListaArticulos', 'readonly');
        const listaArticulos = await txArticulos.store.getAll() as ListaArt[];

        // Filtrar los artículos por el número de lista
        const articulosDeLista = listaArticulos.filter(articulo => articulo.nro_lista === listaCliente);

        // Crear una lista para almacenar los artículos
        const listaDeArticulos: Articulo[] = [];

        // Acceder a los artículos y agregarlos a la lista
        if (articulosDeLista.length > 0) {
            for (const item of articulosDeLista[0].articulosEnLista) {
                // Accedemos a la propiedad 'Articulos' y la agregamos al arreglo
                listaDeArticulos.push(item.Articulos);
            }
        }

        // Establecer los artículos en el estado
        setArticulos(listaDeArticulos);

        tx.done;
        txArticulos.done;

        console.log(listaDeArticulos);  // Verifica el contenido de la lista
        console.log(articulos)
    }
    useEffect(() => {
        ClienteInfo(); // Llama a la función para cargar los datos cuando el componente se monta
    }, []);
    // useEffect para recuperar el cliente seleccionado de localStorage y realizar la consulta de artículos con precios
    /* useEffect(() => {
        // Recupera el cliente seleccionado de localStorage (si existe)
        const CODCL = localStorage.getItem("clienteSeleccionado");
      
        if (CODCL) {
          setClienteSeleccionado(CODCL); // Establece el cliente seleccionado
      
          // Llama a la función que consulta los artículos con sus precios
          fetchArticulosConPrecios();
      
          // Llama a la función para obtener las bonificaciones con el cliente seleccionado
          fetchBonificaciones(Number(CODCL)); // Usamos Number(CODCL) para asegurarnos que sea un número
        }
      }, []); // Se ejecuta una sola vez cuando el componente se monta
   */

    //Fetch de artículos con precios----------------------------------------------

    // Función para recuperar los artículos con sus precios desde la base de datos (Supabase) y agregro traer los ivas
    /* const fetchArticulosConPrecios = async () => {
      const { data, error } = await supabase
        .from("Articulos") // Consultamos la tabla "Articulos"
        .select(`* , Precios(*), Ivas(porc)`); // Seleccionamos todos los campos de "Articulos" y los precios relacionados en la tabla "Precios"
        //console.log(data);
      if (error) {
        console.error("Error al traer artículos:", error); // Si ocurre un error en la consulta, lo mostramos en la consola
        return;
      }
  
      // Tipamos los datos recibidos explícitamente como un array de Articulo
      setArticulos(data as Articulo[]);
    };
 */
    //Fetch de Bonificaciones-----------------------------------------------------
    /* const fetchBonificaciones = async (clienteSucursalId: number) => {
        try {
          // Aquí se hace la consulta filtrando por CODCA_client, que es la clave foránea
          const { data, error } = await supabase
            .from("ClienteSucursal")
            .select(`Bonificaciones(BG_porc)`)  // Aseguramos que traemos la relación Bonificaciones
            .eq('CODCL', clienteSucursalId); // Usamos CODCA_client como la clave foránea para filtrar
            //console.log(data,clienteSucursalId);       
            //console.log((data?.[0].Bonificaciones?.[0].BG_porc) as number); // Accedemos a la bonificación general
            setBonificacionGeneral((data?.[0].Bonificaciones?.BG_porc) as number); // Accedemos a la bonificación general
            if (error) {
            console.error("Error al traer bonificaciones:", error);
            //setBonificacionGeneral(0); // Manejo de error
            return;
          } 
          //setBonificacionGeneral(bonificacion);
        //   console.log("Bonificación general:", bonificacion);
        } catch (err) {
          console.error("Error inesperado al traer bonificaciones:", err);
          setBonificacionGeneral(0);
        }
      }; */


    // FUNCIONES --------------------------------------------------------------


    // Funciones para articulos con precios-------------------------------------

    // Función para manejar el cambio en el campo de búsqueda de artículos
    const handleBusqueda = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBusqueda(event.target.value); // Actualiza el valor de búsqueda
        setArticuloSeleccionado(null); // Limpiar la selección del artículo al cambiar la búsqueda
    };

    // Función para manejar la selección de un artículo en la lista
    const handleSeleccionArticulo = (articulo: Articulo) => {
        setArticuloSeleccionado(articulo); // Establece el artículo seleccionado

        // Agregar log para verificar los datos
        //console.log(articulo.Precios);

        // Verifica si el arreglo de Precios tiene al menos un elemento
        const precio = articulo.Precios.prec_bult;
        /* const precio = articulo.Precios && articulo.Precios.artic_pr > 0
            ? articulo.Precios.prec_bult // Accede al primer precio en el arreglo
            : "No disponible"; // Si no hay precios, muestra "No disponible"
        //console.log(precio) */
        // Actualiza el campo de búsqueda con el nombre y precio del artículo seleccionado
        setBusqueda(`${articulo.artic} - ${articulo.abrev} - $${precio}`);
    };

    // Filtra los artículos en base al texto ingresado en el campo de búsqueda (case-insensitive)
    const articulosFiltrados = articulos.filter(
        (articulo) =>
            articulo.nombre &&
            articulo.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );



    //Funciones para sumar los totales----------------------------------------------

    const handleAgregarArticulo = (cantidad: number) => {
        if (!articuloSeleccionado || cantidad <= 0) return;

        const precio = articuloSeleccionado.Precios.prec_bult;

        // Obtén el porcentaje de IVA desde la relación Ivas
        const porcIVA = articuloSeleccionado.Ivas?.porc || 0;

        // Calcula el descuento específico del artículo
        const descuentoItem =
            bonificacionItem && bonificacionItem > 0
                ? (precio * cantidad * bonificacionItem) / 100
                : 0;

        // Calcula el subtotal sin IVA
        const subtotalSinIVA = precio * cantidad - descuentoItem;

        // Calcula el IVA
        const iva = (subtotalSinIVA * porcIVA) / 100;

        // Calcula el subtotal final con IVA
        const subtotalConIVA = subtotalSinIVA + iva;

        // Actualiza el carrito
        setCarrito((prev) => [
            ...prev,
            {
                articulo: articuloSeleccionado,
                cantidad,
                subtotal: subtotalSinIVA,
                iva,
                total: subtotalConIVA,
            },
        ]);

        setBusqueda("");
        setArticuloSeleccionado(null);
        setBonificacionItem(""); // Limpiar bonificación específica
    };

    const calcularTotal = () => {
        const subtotal = carrito.reduce((acc, item) => acc + item.subtotal, 0);
        const descuentoGeneral = (subtotal * bonificacionGeneral) / 100;

        return { subtotal, descuento: descuentoGeneral, total: subtotal - descuentoGeneral };
    };

    const { subtotal, descuento, total } = calcularTotal();


    // Función para guardar el carrito en la tabla `index`----------------------------------------------

    const handleGuardarPedido = async () => {
        if (carrito.length === 0) {
            setMensaje("El carrito está vacío. No se puede guardar el pedido.");
            return;
        }

        try {
            // Mapeamos los datos del carrito para adaptarlos a los campos de la tabla `index`
            const itemsAGuardar = carrito.map((item) => ({
                nombre: item.articulo.nombre, // Nombre del artículo
                cantidad: item.cantidad, // Cantidad seleccionada
                subtotal: item.subtotal, // Subtotal sin IVA
                iva: item.iva, // IVA calculado
                total: item.total, // Total con IVA
            }));
            console.log(itemsAGuardar);

            // Inserta los datos en la tabla `index`
            // const { error } = await supabase.from("index").insert(itemsAGuardar);

            // if (error) {
            //   console.error("Error al guardar el pedido:", error);
            //   setMensaje("Hubo un error al guardar el pedido. Intente nuevamente.");
            //   return;
            // }

            const db = await setUpDataBase();
            const tx = db.transaction('Pedido', 'readwrite');
            const store = tx.store;

            await store.add(itemsAGuardar);
            tx.done;

            // Muestra mensaje de éxito
            setMensaje("¡El pedido se guardó correctamente!");

            // Limpia el carrito después de guardar
            setCarrito([]);
        } catch (err) {
            console.error("Error inesperado:", err);
            setMensaje("Ocurrió un error inesperado. Intente más tarde.");
        }
    };



    // Función para borrar todo el carrito
    const handleCancelar = () => {
        setCarrito([]); // Limpia el carrito
    };

    // Función para borrar un artículo específico del carrito
    const handleBorrarItem = (index: number) => {
        setCarrito((prev) => prev.filter((_, i) => i !== index)); // Elimina el artículo por índice
    };

    // Función para manejar la navegación a otra página (ruta de visita)
    const handleNavigation = () => {
        window.location.href = "/rutavisita"; // Redirige al usuario a la ruta de visita
    };



    return (
        <div className="min-h-screen bg-white p-8">
            {/* Mensaje emergente */}
            {mensaje && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center">
                        <p className="text-lg font-bold">{mensaje}</p>
                        <button
                            onClick={() => setMensaje(null)} // Cierra el mensaje
                            className="mt-4 bg-black text-white px-4 py-2 rounded"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* Formulario superior */}
            <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg shadow-lg mb-8">
                <div>
                    <label className="block text-gray-700 font-medium">Artículo</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded p-2 mt-1"
                        placeholder="Ingrese el artículo"
                        value={busqueda}
                        onChange={handleBusqueda}
                    />
                    {/* Mostrar sugerencias de búsqueda */}
                    {busqueda && (
                        <ul className="mt-2 max-h-40 overflow-auto border border-gray-300 rounded-lg">
                            {articulosFiltrados.map((articulo) => {
                                // console.log(articulo);
                                const precio = articulo.Precios && articulo.Precios.prec_bult > 0
                                    ? articulo.Precios.prec_bult // Accede al primer precio en el arreglo
                                    : "No disponible";
                                return (
                                    <li
                                        key={articulo.id}
                                        className="p-2 border-b border-gray-200 cursor-pointer"
                                        onClick={() => handleSeleccionArticulo(articulo)}
                                    >
                                        <span className="font-semibold">{articulo.nombre}</span> - ${precio}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Cantidad</label>
                    <input
                        type="number"
                        className="w-full border border-gray-300 rounded p-2 mt-1"
                        placeholder="Ingrese cantidad"
                        value={cantidad}
                        onChange={(e) => setCantidad(Number(e.target.value) || "")}
                    />
                </div>
                {/* Select para la bonificación general */}
                <label htmlFor="bonificacionGeneral">Bonificación General</label>
                <select
                    id="bonificacionGeneral"
                    className="w-full border border-gray-300 rounded p-2 mt-1"
                    value={bonificacionGeneral}
                    onChange={(e) => setBonificacionGeneral(Number(e.target.value))}
                >
                    {/* Opción predeterminada */}
                    <option value={0}>Seleccionar bonificación</option>

                    {/* Opciones generadas dinámicamente */}
                    {clienteSeleccionado?.Bonificaciones && (
                        <>
                            <option value={clienteSeleccionado.Bonificaciones.BG_porc}>
                                {clienteSeleccionado.Bonificaciones.BG_porc}%
                            </option>
                            <option value={clienteSeleccionado.Bonificaciones.Bon_general}>
                                {clienteSeleccionado.Bonificaciones.Bon_general}%
                            </option>
                        </>
                    )}
                </select>

                <div>
                    <label className="block text-gray-700 font-medium">Bon. Item (%)</label>
                    <input
                        type="number"
                        className="w-full border border-gray-300 rounded p-2 mt-1"
                        placeholder="Ingrese bonificación"
                        value={bonificacionItem}
                        onChange={(e) => setBonificacionItem(Number(e.target.value) || "")}
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Ingresar No Compra</label>
                    <select
                        className="w-full border border-gray-300 rounded p-2 mt-1"
                        defaultValue="" // Por defecto se selecciona la opción vacía
                    >
                        <option value="" disabled>Ingresar No Compra</option>
                        <option value="902">902 No Le Interesa</option>
                        <option value="903">903 Prefiere Al Distribuidor</option>
                        <option value="907">907 Tiene Stock</option>
                        <option value="908">908 Tiene Deuda</option>
                        <option value="909">909 Local Cerrado</option>
                        <option value="910">910 Cliente sin Dinero</option>
                        <option value="911">911 Compra Telefónica</option>
                        <option value="912">912 Comprador ausente</option>
                        <option value="913">913 Cambio de rubro</option>
                        <option value="914">914 Cambio de razón social</option>
                        <option value="915">915 Pedido diferido</option>
                        <option value="916">916 Problemas Impositivos</option>
                        <option value="917">917 Solo Retirar Pago</option>
                        <option value="918">918 Compra Próxima Visita</option>
                        <option value="919">919 Local Cerrado por Vacaciones</option>
                        <option value="920">920 No visitado</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Comentario</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded p-2 mt-1"
                        placeholder="Ingrese comentario"
                    />
                </div>
                <button
                    className="bg-black text-white px-6 py-2 rounded-lg font-bold"
                    onClick={() => handleAgregarArticulo(Number(cantidad) || 0)} // Aquí conviertes la cantidad actual a número
                >
                    Agregar
                </button>

            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse border border-gray-300 text-center">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 p-2">Artículos</th>
                            <th className="border border-gray-300 p-2">Cantidad</th>
                            <th className="border border-gray-300 p-2">Sin Imp.</th>
                            <th className="border border-gray-300 p-2">IVA</th>
                            <th className="border border-gray-300 p-2">Sin Imp. + IVA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {carrito.map((item, index) => (
                            <tr key={index}>
                                <td className="border border-gray-300 p-2">
                                    {item.articulo.nombre}
                                </td>
                                <td className="border border-gray-300 p-2">{item.cantidad}</td>
                                <td className="border border-gray-300 p-2">
                                    ${item.subtotal.toFixed(2)}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    ${item.iva.toFixed(2)}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    ${item.total.toFixed(2)}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    <button
                                        className="bg-red-500 text-white px-4 py-1 rounded"
                                        onClick={() => handleBorrarItem(index)} // Llama a la función con el índice
                                    >
                                        Borrar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={2} className="font-bold text-right pr-4">
                                Subtotal:
                            </td>
                            <td>${subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colSpan={2} className="font-bold text-right pr-4">
                                Descuento ({bonificacionGeneral}%):
                            </td>
                            <td>${descuento.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colSpan={2} className="font-bold text-right pr-4">
                                Total:
                            </td>
                            <td>${total.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Botones */}
            <div className="flex justify-center gap-4 mt-8">
                <button onClick={handleNavigation} className="bg-black text-white px-6 py-2 rounded-lg font-bold">
                    Volver
                </button>
                <button
                    onClick={handleCancelar} // Llama a la función que vacía el carrito
                    className="bg-black text-white px-6 py-2 rounded-lg font-bold"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleGuardarPedido} // Guarda el pedido
                    className="bg-black text-white px-6 py-2 rounded-lg font-bold"
                >
                    Terminar
                </button>
            </div>
        </div>
    );
};