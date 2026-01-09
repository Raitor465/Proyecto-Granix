"use client"

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Data } from '@react-google-maps/api';
import {setUpDataBase} from '@/lib/indexedDB';
import { BookDownIcon } from 'lucide-react';

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
    Ivas: {
       porc: number; // El porcentaje de IVA asociado
    };
  }
  
export default function TomarPedido() {
    const [busqueda, setBusqueda] = useState("");
    const [sugerencias, setSugerencias] = useState<any[]>([]);
    const [listaFiltrada, setListaFiltrada] = useState<any[]>([]);
    const [articuloSeleccionado, setArticuloSeleccionado] = useState<any | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null); // Estado para mostrar mensaje de éxito/error
    
    const [cantidad, setCantidad] = useState<number | "">("");
    const [bonificacionGeneral, setBonificacionGeneral] = useState<string>("");  // Corregido tipo a número
    const [bonificacionItem, setBonificacionItem] = useState<string>(""); // Nuevo estado para la bonificación específica del artículo
    const [bonoficacionEsp, setbonoficacionEsp] = useState<string>(); 
    const [porcentajeIva, setPorcentajeIva] = useState<number>(0); 
    const [IVAArticulo, setIVA] = useState<number>(0); 
    
    const [total, setTotal] = useState<number>(0);
    const [carrito, setCarrito] = useState< { articulo: any; cantidad: number; subtotal: number;  valorConPorIva : number}[]>([]);
    const [totalIva, setTotalIva] = useState<number>(0);
    const [totalSinImpuesto, setTotalSinImpuesto] = useState<number>(0);
    const [totalPIva, setTotalPIva] = useState<number>(0);
    const [totalBonGen, setTotalBonGen] = useState<number>(0);
    const [totalBonCompleto, setTotalBonCompleto] = useState<number>(0);

useEffect(() => {
    const bonGen = Number(bonificacionGeneral) || 0;
    const bonItem = Number(bonificacionItem) || 0;
    const bonEsp = Number(bonoficacionEsp) || 0;

    let suma = 0;
    let sinImp = 0;
    let iva = 0;
    let pIva = 0;
    let bonG = 0;
    let bonT = 0;

    for (const car of carrito) {
      suma +=
        car.subtotal +
        car.valorConPorIva -
        car.subtotal * ((bonGen + bonEsp) / 100);

      sinImp += car.subtotal - car.subtotal * (IVAArticulo / 100);
      iva += car.subtotal * (IVAArticulo / 100);
      pIva += car.subtotal * (porcentajeIva / 100);
      bonG += car.subtotal * (bonGen / 100);
      bonT += car.subtotal * ((bonGen + bonEsp) / 100);
    }

    setTotal(suma);
    setTotalSinImpuesto(sinImp);
    setTotalIva(iva);
    setTotalPIva(pIva);
    setTotalBonGen(bonG);
    setTotalBonCompleto(bonT);

  
}, [carrito,bonificacionGeneral,bonificacionItem,bonoficacionEsp]);

    useEffect(() => {
 
    const obtenerArticulosPorCliente = async () => {


        const db = await setUpDataBase();
        const txClienteSelect = db.transaction("ClienteSucursal","readonly")

        const storeCliente = txClienteSelect.store;
        const cliente = await storeCliente.getAll();
        const tplis = cliente[0].TPLIS
        
          if (!tplis) {
            console.error("No se encontró el TPLIS del cliente");
            return;
          }
          setBonificacionGeneral(cliente[0]?.Bonificaciones?.BG_porc ?? 0);
          setbonoficacionEsp(cliente[0]?.BonificacionesEspeciales?.PBOND);
          setPorcentajeIva(cliente[0]?.PercepcionesIva?.PIVAANO ?? 0)
          console.log(cliente[0])
          console.log(cliente[0]?.PercepcionesIva?.PIVAANO) 
    const txArticulos = db.transaction("Precios", "readonly");
    const storeArticulo = txArticulos.store;

    const todosLosArticulos = await storeArticulo.getAll();

     const articulosFiltrados = todosLosArticulos.filter(
        (art: any) => art.TPLIS === tplis
      );
        setListaFiltrada(articulosFiltrados[0].articulos); // o lo que necesites
      };
      obtenerArticulosPorCliente();
  },[]);


  
 const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const texto = e.target.value;
    setBusqueda(texto);
    console.log(listaFiltrada)
    const sugerenciasFiltradas = listaFiltrada.filter((articulo: any) => {
    const codigo = String(articulo.artic_pr ?? "");
    return codigo.includes(texto);
  });
    setSugerencias(sugerenciasFiltradas);
  };

  const handleSeleccionArticulo = (articulo: any) => {
    setBusqueda(articulo.Articulos?.ARTIC || "");
    setArticuloSeleccionado(articulo); // Guardamos el artículo seleccionado
    setIVA(articulo.Articulos?.Ivas?.porc)
    setSugerencias([]);
    };



  const handleAgregarArticulo = () => {
    if (!articuloSeleccionado) {
      setMensaje("Seleccioná un artículo primero");
      return;
    }
    if (!cantidad || Number(cantidad) <= 0) {
      setMensaje("Ingresá una cantidad válida");
      return;
    }
    console.log(porcentajeIva);
    const cant = Number(cantidad);
    const precioUnitario = articuloSeleccionado.prec_bult  //+ (articuloSeleccionado.prec_bult * Number(porcentajeIva) / 100);
    const subtotalBase = (precioUnitario - precioUnitario * (Number(bonificacionItem)/100)) * cant;

    const item = {
      articulo: articuloSeleccionado,
      cantidad: cant,
      subtotal : subtotalBase,
      valorConPorIva : subtotalBase * (Number(porcentajeIva)/100),
    };
    
    setCarrito((prev) => [...prev, item]);
    //setvalorConPorIva(subtotalBase * (Number(porcentajeIva)/100))
    setBusqueda("");
    setArticuloSeleccionado(null);
    setCantidad("");
    setBonificacionItem("");
    setMensaje("Artículo agregado al carrito");
  };
  
  // Función para borrar todo el carrito
    const handleCancelar = () => {
      setCarrito([]); // Limpia el carrito
    };

    // Función para borrar un artículo específico del carrito
    const handleBorrarItem = (index: number) => {
      setCarrito((prev: any[]) => prev.filter((_: any, i: number) => i !== index)); // Elimina el artículo por índice
    };

    const handleTerminar = () => {
      // habria que hacer una tabla de indexed con los pedidos, de tal cliente. 
      // que pidio tantos articulos tanto bulto con tal precio.
      // carrito y con eso habilitado para la deuda.

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

         {busqueda && sugerencias.length > 0 && (
      <ul className="mt-2 max-h-40 overflow-auto border border-gray-300 rounded-lg bg-white">
        {sugerencias.map((articulo, index) => (
          <li
            key={index}
            className="p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
            onClick={() => handleSeleccionArticulo(articulo)}
          >
            <span className="font-semibold">{articulo.artic_pr} </span>
             {articulo.Articulos.nombre} ${articulo.prec_bult}
          </li>
        ))}
      </ul>
    )}
        
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Bulto</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded p-2 mt-1"
            placeholder="Ingrese bulto"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value === "" ? "" : Number(e.target.value))}
            />
        </div>
        <div>
        <label className="block text-gray-700 font-medium">Bon. General (%)</label>
        <input
            type="text"
            className="w-full border border-gray-300 rounded p-2 mt-1"
            value={bonificacionGeneral}
            onChange={(e) => {
              setBonificacionGeneral(e.target.value.replace(",", "."));
            }}
            />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Bon. Item (%)</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded p-2 mt-1"
            placeholder="Ingrese x item"
            value={bonificacionItem}
            onChange={(e) => { 
              setBonificacionItem(e.target.value.replace(",","."))
            }
            }
            
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium">Bon. Rotura (%)</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded p-2 mt-1"
            value={bonoficacionEsp}
            onChange={(e) => {setbonoficacionEsp(e.target.value.replace(",","."));}}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium">Bon. Sin cargo (%)</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded p-2 mt-1"
            
            //onChange={(e) => setBonificacionItem(Number(e.target.value) || "")}
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
            onClick={() => handleAgregarArticulo()} // Aquí conviertes la cantidad actual a número
            >
                Agregar
        </button>

      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300 text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Sim imp</th>
              <th className="border border-gray-300 p-2">IVA</th> 
              <th className="border border-gray-300 p-2">P IVA</th> 
              
               {Number(bonificacionGeneral) !== 0 && total !== 0 && ( 
                <>
                <th className="border border-gray-300 p-2">Bonificacion General</th> 
               </>
               )}

               {(Number(bonificacionGeneral) !== 0 || Number(bonificacionItem) !== 0 || Number(bonoficacionEsp) !==0) && total !== 0 && (
              <th className="border border-gray-300 p-2">Boni Total</th> )
               }

              <th className="border border-gray-300 p-2">Total</th>
            </tr>
          </thead>
          <tbody>
              <tr>
                
                <td className="border border-gray-300 p-2"> 
                  {totalSinImpuesto.toFixed(2)}
                </td>
                <td className="border border-gray-300 p-2"> 
                  {totalIva.toFixed(2)}
                </td>
                <td className="border border-gray-300 p-2"> 
                  {totalPIva.toFixed(2)}
                </td>
                
                {Number(bonificacionGeneral) !== 0 && total !== 0 && ( 
                <>
                <td className="border border-gray-300 p-2"> 
                  {totalBonGen.toFixed(2)}
                </td>
                

                
                </>
                )}
                
                {(Number(bonoficacionEsp) !== 0 || Number(bonificacionItem) !== 0 || Number(bonificacionGeneral) !== 0) && total !== 0 && (
                <>
                <td className="border border-gray-300 p-2"> 
                  {totalBonCompleto.toFixed(2)}
                </td>
                </>
                )}
                <td className="border border-gray-300 p-2"> 
                  {total.toFixed(2)}
                </td>              
              </tr>
          </tbody>
        </table>
      </div>
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300 text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Artículos</th>
              <th className="border border-gray-300 p-2">Bulto</th>
              <th className="border border-gray-300 p-2"></th>

              
            </tr>
          </thead>
          <tbody>
           {carrito.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-300 p-2">
                {item.articulo.Articulos.nombre}
              </td>
              <td className="border border-gray-300 p-2">{item.cantidad}</td>
              

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
            {/* <tr>
              <td colSpan={6} className="font-bold text-right pr-4">
                Total:
              </td>
              <td>${(total).toFixed(2)}</td>
            </tr> */}
          </tfoot>
        </table>
      </div>

      {/* Botones */}
      <div className="flex justify-center gap-4 mt-8">
      <button className="bg-black text-white px-6 py-2 rounded-lg font-bold">
          Volver
        </button>
        <button
          onClick={handleCancelar} // Llama a la función que vacía el carrito
          className="bg-black text-white px-6 py-2 rounded-lg font-bold"
        >
          Cancelar
        </button>
        <button
          // Guarda el pedido
          className="bg-black text-white px-6 py-2 rounded-lg font-bold"
          onClick={handleTerminar}
        >
          Terminar
        </button>
      </div>
    </div>
  )
}


