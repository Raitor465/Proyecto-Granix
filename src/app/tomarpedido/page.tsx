"use client"

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Data } from '@react-google-maps/api';


interface Precio {
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
  }
  

  export default function TomarPedido() {
    // Definición del estado para el cliente seleccionado
    const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
  
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
  



    // useEffect para recuperar el cliente seleccionado de localStorage y realizar la consulta de artículos con precios
    useEffect(() => {
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
  

    //Fetch de artículos con precios----------------------------------------------

    // Función para recuperar los artículos con sus precios desde la base de datos (Supabase) y agregro traer los ivas
    const fetchArticulosConPrecios = async () => {
      const { data, error } = await supabase
        .from("Articulos") // Consultamos la tabla "Articulos"
        .select(`* , Precios(*), Ivas(porc)`); // Seleccionamos todos los campos de "Articulos" y los precios relacionados en la tabla "Precios"
        console.log(data);
      if (error) {
        console.error("Error al traer artículos:", error); // Si ocurre un error en la consulta, lo mostramos en la consola
        return;
      }
  
      // Tipamos los datos recibidos explícitamente como un array de Articulo
      setArticulos(data as Articulo[]);
    };

    //Fetch de Bonificaciones-----------------------------------------------------
    const fetchBonificaciones = async (clienteSucursalId: number) => {
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
      };
          
  
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
        const precio = articulo.Precios && articulo.Precios.artic_pr > 0
            ? articulo.Precios.prec_bult // Accede al primer precio en el arreglo
            : "No disponible"; // Si no hay precios, muestra "No disponible"
        //console.log(precio)
        // Actualiza el campo de búsqueda con el nombre y precio del artículo seleccionado
        setBusqueda(`${articulo.artic} - ${articulo.abrev} - $${precio}`);
    };
  
    // Filtra los artículos en base al texto ingresado en el campo de búsqueda (case-insensitive)
    const articulosFiltrados = articulos.filter((articulo) =>
      articulo.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    //--------------------------------------------------------------------------------
    // Funciones para




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
    



  
    // Función para manejar la navegación a otra página (ruta de visita)
    const handleNavigation = () => {
      window.location.href = "/rutavisita"; // Redirige al usuario a la ruta de visita
    };

    

    return (
    <div className="min-h-screen bg-white p-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Cargar Pedido</h1>
      </div>

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
                const precio = articulo.Precios && articulo.Precios.artic_pr > 0
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
        <div>
        <label className="block text-gray-700 font-medium">Bon. General (%)</label>
        <input
            type="text"
            className="w-full border border-gray-300 rounded p-2 mt-1"
            value={bonificacionGeneral}
            
            />
        </div>
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
        <button className="bg-black text-white px-6 py-2 rounded-lg font-bold">
          Cancelar
        </button>
        <button className="bg-black text-white px-6 py-2 rounded-lg font-bold">
          Terminar
        </button>
      </div>
    </div>
  );
};