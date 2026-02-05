"use client"

import React, { useState, useEffect } from 'react';
import {setUpDataBase} from '@/lib/indexedDB';
// INTEGRACIÓN CARRITO: Importar el hook para acceder al carrito global
import { useCarrito } from '@/lib/carritoContext';
import { useRouter } from 'next/navigation';
  
export default function TomarPedido() {
    const router = useRouter();
    // INTEGRACIÓN CARRITO: Obtener la función agregarItem del contexto
    const { agregarItem } = useCarrito();
    const [busqueda, setBusqueda] = useState("");
    const [sugerencias, setSugerencias] = useState<any[]>([]);
    const [listaFiltrada, setListaFiltrada] = useState<any[]>([]);
    const [articuloSeleccionado, setArticuloSeleccionado] = useState<any | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [cantidad, setCantidad] = useState<number | "">("");
    const [bonificacionGeneral, setBonificacionGeneral] = useState<string>("");
    const [bonificacionItem, setBonificacionItem] = useState<string>("");
    const [bonoficacionEsp, setbonoficacionEsp] = useState<string>(""); 
    const [porcentajeIva, setPorcentajeIva] = useState<number>(0); 
    const [IVAArticulo, setIVA] = useState<number>(0); 
    
    const [total, setTotal] = useState<number>(0);
    const [carrito, setCarrito] = useState< { articulo: any; cantidad: number; subtotal: number;  valorConPorIva : number; bonificacionItem: number, IVA : number}[]>([]);
    const [totalIva, setTotalIva] = useState<number>(0);
    const [totalSinImpuesto, setTotalSinImpuesto] = useState<number>(0);
    const [totalPIva, setTotalPIva] = useState<number>(0);
    const [totalBonGen, setTotalBonGen] = useState<number>(0);
    const [totalBonCompleto, setTotalBonCompleto] = useState<number>(0);
    const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
    const [resultadoVisita, setResultadoVisita] = useState<"CONFORME" | "DISCONFORME">("CONFORME");
    const [ motivoNoCompra, setMotivoNoCompra] = useState<string | null>(null);
    const [comentario, setComentario] = useState<string>("");

useEffect(() => {
  
  const bonGen = Number(bonificacionGeneral || 0);
  const bonEsp = Number(bonoficacionEsp || 0);
    let suma = 0;
    let sinImp = 0;
    let iva = 0;
    let pIva = 0;
    let bonG = 0;
    let bonT = 0;
    let bonItemT = 0;

    for (const car of carrito) {
      suma +=
        car.subtotal +
        car.valorConPorIva -
        car.subtotal * ((bonGen + bonEsp) / 100);

      sinImp += car.subtotal - car.subtotal * (car.IVA / 100);
      iva += car.subtotal * (car.IVA / 100);
      pIva += car.subtotal * (porcentajeIva / 100);
      bonG += car.subtotal * (bonGen / 100);
      bonT = bonT + car.subtotal * ((bonGen + bonEsp) / 100);
      bonItemT += (car.articulo.prec_bult * (100 / (100 - car.bonificacionItem))) * (car.bonificacionItem/100);
    }
    bonT += bonItemT
    setTotal(suma);
    setTotalSinImpuesto(sinImp);
    setTotalIva(iva);
    setTotalPIva(pIva);
    setTotalBonGen(bonG);
    setTotalBonCompleto(bonT);

  
}, [carrito,bonificacionGeneral,bonoficacionEsp]);

  const calcularTotales = ({
    carrito,
    bonGen,
    bonEsp,
    porcentajeIva
  }: any) => {
    let total = 0;
    let sinImp = 0;
    let iva = 0;
    let pIva = 0;
    let bonG = 0;
    let bonT = 0;
    let bonItemT = 0;

    for (const car of carrito) {
      total +=
        car.subtotal +
        car.valorConPorIva -
        car.subtotal * ((bonGen + bonEsp) / 100);

      sinImp += car.subtotal - car.subtotal * (car.IVA / 100);
      iva += car.subtotal * (car.IVA / 100);
      pIva += car.subtotal * (porcentajeIva / 100);
      bonG += car.subtotal * (bonGen / 100);
      bonT +=
        car.subtotal * ((bonGen + bonEsp) / 100);
      bonItemT += (car.articulo.prec_bult * (100 / (100 - car.bonificacionItem))) * (car.bonificacionItem/100);
    }
    bonT += bonItemT
    return {
      total,
      totalSinImpuesto: Number(sinImp.toFixed(2)),
      totalIva: Number(iva.toFixed(2)),
      totalPIva: Number(pIva.toFixed(2)),
      totalBonGen: Number(bonG.toFixed(2)),
      totalBonCompleto: Number(bonT.toFixed(2)),
    };
  };

  const obtenerClienteActual = async () =>{
    const db = await setUpDataBase();
    const txClienteSelect = db.transaction("ClienteSucursal","readonly")

        const storeCliente = txClienteSelect.store;
        const clientes = await storeCliente.getAll();
        
        if (!clientes.length){
          console.error("No se encontró cliente")
          return null;
        }

        const cliente = clientes[0]
        const tplis = cliente.TPLIS
        
        if (!tplis) {
          console.error("No se encontró el TPLIS del cliente");
          return null
        }

        return {
          db,cliente,tplis
        }
      
  }

    useEffect(() => {
 
    const obtenerArticulosPorCliente = async () => {
        const data = await obtenerClienteActual();

        if (!data) return ;

        const {db, cliente, tplis} = data
        console.log(cliente)
        const txArticulos = db.transaction("Precios", "readonly");
        const storeArticulo = txArticulos.store;
        const todosLosArticulos = await storeArticulo.getAll();
        await txArticulos.done 
        const articulosFiltrados = todosLosArticulos.filter(
          (art: any) => art.TPLIS === tplis);
        setListaFiltrada(articulosFiltrados[0].articulos); 

        const txPedido = db.transaction("Pedido", "readonly");
        const store = txPedido.objectStore("Pedido");
        const index = store.index("clienteId");
        const pedido = await index.get(cliente.CODCL);
        await txPedido.done;
        if (pedido) {
          setCarrito(pedido.carrito || []);
          setBonificacionGeneral(String(pedido.bonificaciones?.general ?? ""));
          setbonoficacionEsp(String(pedido.bonificaciones?.especial ?? ""));   
        }else{
            setBonificacionGeneral(String(cliente?.Bonificaciones?.BG_porc ?? ""));
            setbonoficacionEsp(String(cliente?.BonificacionesEspeciales?.PBOND ?? ""));
        }
        setPorcentajeIva(cliente?.PercepcionesIva?.PIVAANO ?? 0)

      };       
      obtenerArticulosPorCliente();
  },[]);

  const normalizarNumero = (valor : string) => {
    const v = valor.replace(",",".");
    
    if (!/^\d*\.?\d*$/.test(v)) return null;
    return v;
  }

  const sumaBonificaciones = ( bg : string , bi : string , be: string) => {
      return ( Number(bg || 0) + Number (bi || 0) + Number (be || 0))
  }
  
 const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const texto = e.target.value;
    setBusqueda(texto);
    const sugerenciasFiltradas = listaFiltrada.filter((articulo: any) => {
    const codigo = String(articulo.artic_pr ?? "");
    return codigo.includes(texto);
  });
    setSugerencias(sugerenciasFiltradas);
  };

  const handleSeleccionArticulo = (articulo: any) => {
    const indexExistente = carrito.findIndex(
    (c) => c.articulo.artic_pr === articulo.artic_pr);
      if (indexExistente !== -1) {
      const item = carrito[indexExistente];
      setArticuloSeleccionado(item.articulo);
      setCantidad(item.cantidad);
      setBonificacionItem(String(item.bonificacionItem) === "0" ? "" : String(item.bonificacionItem))
      setEditandoIndex(indexExistente);
    } else {
      setArticuloSeleccionado(articulo);
      setCantidad("");
      setBonificacionItem("");
      setEditandoIndex(null);
    }
    setBusqueda(articulo.Articulos?.ARTIC || "");
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
    const cant = Number(cantidad);
    const precioUnitario = articuloSeleccionado.prec_bult
    const subtotalBase = (precioUnitario - (precioUnitario * (Number(bonificacionItem)/100))) * cant;
    console.log(bonificacionGeneral,bonoficacionEsp)
    const item = {
      articulo: articuloSeleccionado,
      cantidad: cant,
      subtotal : subtotalBase,
      valorConPorIva : subtotalBase * (Number(porcentajeIva)/100),
      bonificacionItem : Number(bonificacionItem),
      IVA : IVAArticulo
    };
    
     setCarrito((prev) => {
    const copia = [...prev];

    if (editandoIndex !== null) {
      copia[editandoIndex] = item; // ✏️ editar
    } else {
      copia.push(item); // ➕ agregar
    }

    return copia;
  });
    setBusqueda("");
    setArticuloSeleccionado(null);
    setCantidad("");
    setBonificacionItem("");
    setEditandoIndex(null)
    setMensaje("Artículo agregado al carrito");
  };
  
  // Función para borrar todo el carrito
    const handleCancelar = async () => {
      setCarrito([]);
      setComentario("");
      setResultadoVisita("CONFORME")
      setMotivoNoCompra(null)
      //setSugerencias([])
       const data = await obtenerClienteActual()
        if (!data) return ;

        const {db , cliente} = data
        const tx = db.transaction("Pedido","readwrite")
        const store = tx.objectStore("Pedido")
        const index = store.index("clienteId")
        const clienteId = cliente.CODCL

        const pedidoExistente = await index.get(clienteId)
        if (pedidoExistente){
          await store.delete(pedidoExistente.id)
          setMensaje("Pedido eliminado (carrito vacío)")
        }
          await tx.done
          return;
    };

    // Función para borrar un artículo específico del carrito
    const handleBorrarItem = async (index: number) => {
      setCarrito((prev: any[]) => prev.filter((_: any, i: number) => i !== index)); 
      if (editandoIndex === index){
        setArticuloSeleccionado(null)
        setCantidad("")
        setBonificacionItem("")
        setBusqueda("")
        setEditandoIndex(null)
      }
      if (carrito.length === 1){
        setResultadoVisita("CONFORME")
        setMotivoNoCompra(null)
      }
      setMensaje("Artículo eliminado del carrito")
    };

    const handleEditarItem = (index: number) => {
      const item = carrito[index];
      console.log(item)
      setArticuloSeleccionado(item.articulo);
      setCantidad(item.cantidad);
      setBonificacionItem(String(item.bonificacionItem) === "0" ? "" : String(item.bonificacionItem));
      setEditandoIndex(index); 
      setBusqueda(String(item.articulo.artic_pr))
      setIVA(item.IVA) 
      setSugerencias([])  
    };


    const handleGuardarLocal = async () => {
      try{
        if (resultadoVisita === "DISCONFORME" && !motivoNoCompra){
          setMensaje("Debe seleccionar un motivo de no compra")
          return;
        }
        
        const data = await obtenerClienteActual()
        if (!data) return ;

        const {db , cliente} = data

        const tx = db.transaction("Pedido","readwrite")
        const store = tx.objectStore("Pedido")
        const index = store.index("clienteId")
        const clienteId = cliente.CODCL

        const pedidoExistente = await index.get(clienteId)

        if (carrito.length === 0){
          if (pedidoExistente){
            await store.delete(pedidoExistente.id)
            setMensaje("Pedido eliminado (carrito vacío)")
          }
          await tx.done
          return;
        }
        const bonGen = Number(bonificacionGeneral) || 0;
        const bonEsp = Number(bonoficacionEsp) || 0;

        const totales = calcularTotales({
          carrito,bonGen,bonEsp,porcentajeIva,IVAArticulo
        });


        const pedido = {
          clienteId : cliente.CODCL,
          carrito,
          bonificaciones : {
            general : bonificacionGeneral,
            especial : bonoficacionEsp,
          },
          totales,
          resultadoVisita,
          motivoNoCompra: resultadoVisita === "DISCONFORME" ? motivoNoCompra : null,
          comentario: comentario.trim() ? comentario : "Sin comentario",
        }

        if (pedidoExistente){
          await store.put({ ...pedidoExistente,...pedido, id:pedidoExistente.id})          
        }else{
          await store.add({...pedido})
        }
        await tx.done;
        
        // INTEGRACIÓN CARRITO: Agregar el pedido al carrito global
        // Esto permite que el pedido se sincronice junto con otros cambios
        await agregarItem({
          tipo: 'pedido',                  // Identifica que es un pedido
          cliente_id: cliente.CODCL,       // ID del cliente
          cliente_nombre: cliente.nombre,  // Nombre para mostrar en el carrito
          items: carrito,                  // Array de artículos del pedido
          total: totales.total,            // Total calculado del pedido
          fecha: new Date().toISOString(), // Timestamp actual
          sincronizado: false              // Marca como pendiente de sincronizar
        });
        
        setMensaje("Pedido guardado localmente y agregado al carrito");
      }catch(err){
        console.error(err)
        setMensaje("Error al guardar al pedido")
      }
    };

    const limpiarEdicion = () => {
      setArticuloSeleccionado(null);
      setCantidad("");
      setBonificacionItem("");
      setBusqueda("");
      setEditandoIndex(null);
      setSugerencias([]);
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
      {/* <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Cargar Pedido</h1>
      </div> */}

      {/* Formulario superior */}
      <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg shadow-lg mb-8">
      <div>
        <label className="block text-gray-700 font-medium">Artículo</label>
        <input
            disabled={editandoIndex !== null}
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
            value={cantidad === 0 ? "" : cantidad}
            onChange={(e) => setCantidad(e.target.value === "" ? "" : Number(e.target.value))}
            />
        </div>
        <div>
        <label className="block text-gray-700 font-medium">Bon. General (%)</label>
        <input
            type="number"
            className="w-full border border-gray-300 rounded p-2 mt-1"
            placeholder='Ingresar Bonificación General'
            value={Number(bonificacionGeneral) === 0 ? "" : bonificacionGeneral}
            onChange={(e) => {
              const v = normalizarNumero(e.target.value);
              if (v === null) return;
              if (sumaBonificaciones(v,bonificacionItem , bonoficacionEsp) > 100) {
                  setMensaje("La suma de bonificaciones no puede superar el 100%");
                  return;
              }
              setBonificacionGeneral(v);
            }}
            />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Bon. Item (%)</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded p-2 mt-1"
            placeholder="Ingrese Bonificacion por Item"
            value={Number(bonificacionItem) === 0 ? "" : bonificacionItem}
            onChange={(e) => { 
              const v = normalizarNumero(e.target.value);
              if (v === null) return;
              if (sumaBonificaciones(v,bonificacionItem , bonoficacionEsp) > 100) {
                  setMensaje("La suma de bonificaciones no puede superar el 100%");
                  return;
              }
              setBonificacionItem(v);
            }
            }
            
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium">Bon. Rotura (%)</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded p-2 mt-1"
            value={Number(bonoficacionEsp) !== 0 ? bonoficacionEsp : ""}
            placeholder='Ingresar Bonficacion Especial'
            onChange={(e) => {
              const v = normalizarNumero(e.target.value);
              if (v === null) return;
              if (sumaBonificaciones(v,bonificacionItem , bonoficacionEsp) > 100) {
                  setMensaje("La suma de bonificaciones no puede superar el 100%");
                  return;
              }
              setbonoficacionEsp(v);
            }}
          />
        </div>

        <div>
          <label className="block text-gray-700">Bon. Sin cargo (%)</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded p-2 mt-1"
          />
        </div>

        <div>
        {/* <label className="block text-gray-700 font-medium">Ingresar No Compra</label> */}
        <select
          value={motivoNoCompra ?? ""}
          className={`w-full border p-2 mt-1 ${
            resultadoVisita === "DISCONFORME" ? "text-black" : "text-gray-400"
          }`}
          disabled={resultadoVisita !== "DISCONFORME"}
          onChange={(e) => setMotivoNoCompra(e.target.value)}
        >

          <option value="CONFORME" >Sin disconformidad</option>
          <option value="DISCONFORME" >Disconformidad</option>
        </select>
      </div>

      <div>
        <select
          value={motivoNoCompra ?? ""}
          className={"w-full border p-2 mt-1  ${resultadoVisita === 'DISCONFORME' ? 'text-black : 'text-gray-400' }"}
          disabled={resultadoVisita !== "DISCONFORME"} onChange={(e) => setMotivoNoCompra(e.target.value)}
        >
          <option value="" disabled>Ingresar No Compra</option>
          <option value="902">902 No Le Interesa</option>
          <option value="903">903 Prefiere Al Distribuidor</option>
          <option value="904">904 No se encontró la dirección</option>
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
        <div className='w-full'>
          <label className="block text-gray-700 font-medium">Comentario</label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-md p-3 mt-1 
                        resize-none "//focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Ej: entregar por la tarde, llamar antes, dejar en recepción"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
        </div>
        <div> </div>
        <button
            className="bg-black text-white px-6 py-2 rounded-lg font-bold"
            onClick={() => handleAgregarArticulo()} // Aquí conviertes la cantidad actual a número
            >
              {editandoIndex !== null ? "Actualizar" : "Agregar"}
        </button>

         {editandoIndex !== null && (
        <button
            className="bg-gray-500 text-white px-6 py-2 rounded-lg font-bold"
            onClick={limpiarEdicion}
          >
            Cancelar edición
          </button>
        )} 

      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300 text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Sin impuesto</th>
              <th className="border border-gray-300 p-2">IVA</th> 
              <th className="border border-gray-300 p-2">P IVA</th> 
              
               {Number(bonificacionGeneral) !== 0  && total !== 0 && bonificacionGeneral !== undefined && (
                <>
                <th className="border border-gray-300 p-2">Bonificacion General</th> 
               </>
               )}

                {((Number(bonificacionGeneral) !== 0 && bonificacionGeneral !== undefined) || (Number(bonoficacionEsp) !==0 && bonificacionGeneral !== undefined) || totalBonCompleto !== 0) && total !== 0 && (
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
                
                {Number(bonificacionGeneral) !== 0 && bonificacionGeneral !== "" && total !== 0 && bonificacionGeneral !== undefined && (
                <>
                <td className="border border-gray-300 p-2"> 
                  {totalBonGen.toFixed(2)}
                </td>
                </>
                )}

                {((Number(bonificacionGeneral) !== 0 && bonificacionGeneral !== undefined) || (Number(bonoficacionEsp) !==0 && bonificacionGeneral !== undefined) || totalBonCompleto !== 0) && total !== 0 && (
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
                  <div className='flex justify-center gap-4'>
                     <button
                    className="bg-blue-500 text-white px-4 py-1 rounded"
                    onClick={() => handleEditarItem(index)}
                  >
                    Editar
                  </button>

                  <button
                    className="bg-red-500 text-white px-4 py-1 rounded"
                    onClick={() => handleBorrarItem(index)}
                  >
                    Borrar
                  </button>
                  </div>
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
        <button className="bg-black text-white px-6 py-2 rounded-lg font-bold"
          onClick={() => router.back()}
        >
          
          Volver
        </button>
        <button
          onClick={handleCancelar}
          className="bg-black text-white px-6 py-2 rounded-lg font-bold"

        >
          Cancelar
        </button>

        <button 
          onClick={handleGuardarLocal}
          className="bg-black text-white px-6 py-2 rounded-lg font-bold"
        >
          Guardar
        </button>
      </div>
    </div>
  )
}


