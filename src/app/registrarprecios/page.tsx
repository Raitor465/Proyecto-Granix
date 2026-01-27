"use client"

import React, { useState, useEffect } from 'react';
import { Menu, LogOut, Search, Save } from 'lucide-react';
// Importamos la función para acceder a la base de datos local (IndexedDB)
import { setUpDataBase } from '@/lib/indexedDB';
import { supabase } from '@/lib/supabase';

// Interface para tipar los artículos que vienen de la base de datos
// Esta es la estructura real de los datos que guardamos en el login
interface Articulo {
    artic_pr: string          // Código del artículo
    TPLIS: number            // Número de lista de precios
    NULIS: number            // Número de versión de la lista
    prec_bult: number        // Precio por bulto (el que vamos a editar)
    Articulos: {
        ARTIC: string        // Código del artículo
        nombre: string       // Nombre completo del producto
        abrev: string        // Abreviación
        Ivas: {
            porc: number     // Porcentaje de IVA
        }
    }
}

// Interface para la estructura de cada lista de precios guardada en IndexedDB
interface ListaPrecios {
    TPLIS: number           // Identificador de la lista
    articulos: Articulo[]   // Array de artículos de esta lista
}

export default function RegistrarPrecio() {
    // Estado para la búsqueda de artículos
    const [entradaBusqueda, setEntradaBusqueda] = useState('');
    
    // Estado para todas las listas de precios disponibles (traídas de IndexedDB)
    // Cada lista tiene un TPLIS y un array de artículos
    const [listasDePrecio, setListasDePrecio] = useState<ListaPrecios[]>([]);
    
    // Estado para saber qué lista de precios estamos viendo/editando actualmente
    // Por defecto será null hasta que carguemos los datos
    const [tplisSeleccionado, setTplisSeleccionado] = useState<number | null>(null);
    
    // Estado para los artículos que se muestran en la tabla
    // Estos son los artículos de la lista seleccionada, filtrados por la búsqueda
    const [articulosFiltrados, setArticulosFiltrados] = useState<Articulo[]>([]);
    
    // Estado para guardar los precios que el usuario está editando
    // La key es el código del artículo (artic_pr) y el valor es el nuevo precio
    const [preciosEditables, setPreciosEditables] = useState<{ [key: string]: string }>({});
    
    // Estado para el cliente seleccionado (viene de IndexedDB)
    const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
    const [nombreCliente, setNombreCliente] = useState<string>('');
    
    // Estado para el carrito de cambios de precios pendientes
    const [carritoCambios, setCarritoCambios] = useState<any[]>([]);
    const [mostrarCarrito, setMostrarCarrito] = useState(false);
    
    // Estado para precios personalizados del cliente actual
    const [preciosPersonalizados, setPreciosPersonalizados] = useState<{ [key: string]: number }>({});

    // useEffect que se ejecuta al cargar el componente
    // Su propósito es traer los datos de IndexedDB y cargarlos en el estado
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                // 1. Abrimos/conectamos a la base de datos local
                const db = await setUpDataBase();
                
                // 2. Cargar cliente seleccionado desde ClienteSucursal
                const txCliente = db.transaction('ClienteSucursal', 'readonly');
                const storeCliente = txCliente.objectStore('ClienteSucursal');
                const clientes = await storeCliente.getAll();
                
                if (clientes.length > 0) {
                    const cliente = clientes[0];
                    setClienteSeleccionado(cliente.CODCL);
                    setNombreCliente(cliente.nombre || '');
                    console.log('Cliente cargado:', cliente.CODCL, cliente.nombre);
                } else {
                    console.warn('No hay cliente seleccionado en ClienteSucursal');
                }
                
                // 3. Cargar listas de precios
                const txPrecios = db.transaction('Precios', 'readonly');
                const storePrecios = txPrecios.objectStore('Precios');
                const todasLasListas = await storePrecios.getAll();
                
                console.log('Listas de precios cargadas:', todasLasListas);
                setListasDePrecio(todasLasListas);
                
                if (todasLasListas.length > 0) {
                    setTplisSeleccionado(todasLasListas[0].TPLIS);
                }
                
                // 4. Cargar carrito de cambios pendientes
                const txCarrito = db.transaction('CarritoCambiosPrecios', 'readonly');
                const storeCarrito = txCarrito.objectStore('CarritoCambiosPrecios');
                const cambiosPendientes = await storeCarrito.getAll();
                setCarritoCambios(cambiosPendientes);
                console.log('Cambios pendientes cargados:', cambiosPendientes);
                
                // 5. Cargar precios personalizados del cliente desde Supabase
                if (clientes.length > 0) {
                    const clienteId = clientes[0].CODCL;
                    const { data: preciosCliente, error } = await supabase
                        .from('precios_clientes')
                        .select('*')
                        .eq('cliente_id', clienteId);
                    
                    const preciosMap: { [key: string]: number } = {};
                    
                    if (!error && preciosCliente) {
                        preciosCliente.forEach((p: any) => {
                            preciosMap[p.articulo_id] = p.precio;
                        });
                        console.log('Precios personalizados desde Supabase:', preciosMap);
                    }
                    
                    // También incluir precios del carrito para este cliente (sobrescriben Supabase)
                    cambiosPendientes.forEach((cambio: any) => {
                        if (cambio.cliente_id === clienteId) {
                            preciosMap[cambio.articulo_id] = cambio.precio_nuevo;
                        }
                    });
                    
                    setPreciosPersonalizados(preciosMap);
                    console.log('Precios personalizados finales:', preciosMap);
                }
                
            } catch (error) {
                console.error('Error al cargar datos:', error);
            }
        };
        
        cargarDatos();
    }, []);

    // useEffect para filtrar artículos cuando cambia la lista seleccionada o la búsqueda
    // Se ejecuta cada vez que: tplisSeleccionado, listasDePrecio o entradaBusqueda cambian
    useEffect(() => {
        // Si no hay lista seleccionada, no hacemos nada
        if (tplisSeleccionado === null) {
            setArticulosFiltrados([]);
            return;
        }
        
        // 1. Buscamos la lista de precios que corresponde al TPLIS seleccionado
        const listaActual = listasDePrecio.find(lista => lista.TPLIS === tplisSeleccionado);
        
        // Si no encontramos la lista, salimos
        if (!listaActual) {
            setArticulosFiltrados([]);
            return;
        }
        
        // 2. Filtramos los artículos según lo que el usuario escribió en la búsqueda
        // Buscamos coincidencias en:
        //   - El código del artículo (artic_pr)
        //   - El nombre del artículo (Articulos.nombre)
        //   - La abreviación (Articulos.abrev)
        const filtrados = listaActual.articulos.filter(articulo => {
            const textoMinuscula = entradaBusqueda.toLowerCase();
            const codigo = articulo.artic_pr?.toString() || '';
            const nombre = articulo.Articulos?.nombre?.toLowerCase() || '';
            const abrev = articulo.Articulos?.abrev?.toLowerCase() || '';
            
            return codigo.includes(entradaBusqueda) || 
                   nombre.includes(textoMinuscula) || 
                   abrev.includes(textoMinuscula);
        });
        
        // 3. Actualizamos el estado con los artículos filtrados
        setArticulosFiltrados(filtrados);
        
    }, [tplisSeleccionado, listasDePrecio, entradaBusqueda]); // Se ejecuta cuando cambian estos valores

    // Función para manejar cuando el usuario escribe un nuevo precio
    // Parámetros:
    //   - codigo: el artic_pr del artículo que se está editando
    //   - valor: el nuevo precio que el usuario escribió
    const manejarCambioPrecio = (codigo: string, valor: string) => {
        // Guardamos el nuevo valor en el estado de preciosEditables
        // Usamos el código del artículo como key
        setPreciosEditables(prev => ({ ...prev, [codigo]: valor }));
    };

    // Función para guardar el nuevo precio de un artículo en el carrito
    // Esta función actualiza el precio en IndexedDB local y agrega el cambio al carrito
    const manejarGuardarPrecio = async (codigo: string) => {
        // 1. Convertimos el precio a número
        const nuevoPrecio = parseFloat(preciosEditables[codigo]);
        
        // 2. Validamos que sea un número válido
        if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
            alert('Por favor ingresá un precio válido');
            return;
        }
        
        // 3. Validar que haya un cliente seleccionado
        if (!clienteSeleccionado) {
            alert('Por favor seleccioná un cliente primero');
            return;
        }
        
        try {
            // 4. Abrimos la base de datos
            const db = await setUpDataBase();
            
            // 5. Obtenemos la lista actual de IndexedDB para obtener el precio anterior
            const txPrecios = db.transaction('Precios', 'readonly');
            const storePrecios = txPrecios.objectStore('Precios');
            const listaActual = await storePrecios.get(tplisSeleccionado!);
            
            if (!listaActual) {
                console.error('No se encontró la lista de precios');
                return;
            }
            
            // 6. Buscamos el artículo específico dentro de la lista
            const articulo = listaActual.articulos.find(
                (art: Articulo) => art.artic_pr === codigo
            );
            
            if (!articulo) {
                console.error('No se encontró el artículo');
                return;
            }
            
            const precioAnterior = articulo.prec_bult;
            
            // 7. Crear el objeto de cambio para el carrito
            const cambio = {
                cliente_id: clienteSeleccionado,
                cliente_nombre: nombreCliente,
                articulo_id: codigo,
                articulo_nombre: articulo.Articulos?.nombre || 'Sin nombre',
                precio_anterior: precioAnterior,
                precio_nuevo: nuevoPrecio,
                tplis: tplisSeleccionado,
                fecha_modificacion: new Date().toISOString(),
                sincronizado: false
            };
            
            // 8. Guardar en el carrito (IndexedDB)
            const txCarrito = db.transaction('CarritoCambiosPrecios', 'readwrite');
            const storeCarrito = txCarrito.objectStore('CarritoCambiosPrecios');
            await storeCarrito.add(cambio);
            await txCarrito.done;
            
            console.log('Cambio agregado al carrito:', cambio);
            
            // 9. Actualizar el estado del carrito
            setCarritoCambios(prev => [...prev, cambio]);
            
            // 10. Actualizar los precios personalizados del cliente actual
            setPreciosPersonalizados(prev => ({
                ...prev,
                [codigo]: nuevoPrecio
            }));
            
            // 11. Limpiamos el estado de edición para este artículo
            setPreciosEditables(prev => {
                const nuevoEstado = { ...prev };
                delete nuevoEstado[codigo];
                return nuevoEstado;
            });
            
            alert('Cambio agregado al carrito. No olvides sincronizar.');
            
        } catch (error) {
            console.error('Error al guardar en el carrito:', error);
            alert('Error al guardar el cambio');
        }
    };

    // Función para sincronizar todos los cambios del carrito con Supabase
    const sincronizarConSupabase = async () => {
        if (carritoCambios.length === 0) {
            alert('No hay cambios pendientes para sincronizar');
            return;
        }
        
        try {
            const db = await setUpDataBase();
            let errores = 0;
            let exitosos = 0;
            
            // Procesar cada cambio del carrito
            for (const cambio of carritoCambios) {
                if (cambio.sincronizado) continue; // Saltar los ya sincronizados
                
                // Insertar/actualizar en Supabase
                const { error } = await supabase
                    .from('precios_clientes')
                    .upsert({
                        cliente_id: cambio.cliente_id,
                        articulo_id: cambio.articulo_id,
                        precio: cambio.precio_nuevo,
                        tplis: cambio.tplis
                    }, {
                        onConflict: 'cliente_id,articulo_id'
                    });
                
                if (error) {
                    console.error('Error al sincronizar:', error);
                    errores++;
                } else {
                    exitosos++;
                    
                    // Marcar como sincronizado en IndexedDB
                    const txCarrito = db.transaction('CarritoCambiosPrecios', 'readwrite');
                    const storeCarrito = txCarrito.objectStore('CarritoCambiosPrecios');
                    
                    // Actualizar el registro
                    if (cambio.id) {
                        cambio.sincronizado = true;
                        await storeCarrito.put(cambio);
                    }
                    await txCarrito.done;
                }
            }
            
            // Actualizar estado del carrito
            const txCarrito = db.transaction('CarritoCambiosPrecios', 'readonly');
            const storeCarrito = txCarrito.objectStore('CarritoCambiosPrecios');
            const cambiosActualizados = await storeCarrito.getAll();
            setCarritoCambios(cambiosActualizados);
            
            alert(`Sincronización completa: ${exitosos} exitosos, ${errores} errores`);
            
        } catch (error) {
            console.error('Error en la sincronización:', error);
            alert('Error al sincronizar con el servidor');
        }
    };
    
    // Función para limpiar el carrito de cambios ya sincronizados
    const limpiarCarritoSincronizado = async () => {
        try {
            const db = await setUpDataBase();
            const txCarrito = db.transaction('CarritoCambiosPrecios', 'readwrite');
            const storeCarrito = txCarrito.objectStore('CarritoCambiosPrecios');
            
            // Obtener todos los cambios
            const todosCambios = await storeCarrito.getAll();
            
            // Eliminar solo los sincronizados
            for (const cambio of todosCambios) {
                if (cambio.sincronizado && cambio.id) {
                    await storeCarrito.delete(cambio.id);
                }
            }
            
            await txCarrito.done;
            
            // Actualizar estado
            const cambiosRestantes = todosCambios.filter(c => !c.sincronizado);
            setCarritoCambios(cambiosRestantes);
            
            alert('Carrito limpiado. Se eliminaron los cambios sincronizados.');
            
        } catch (error) {
            console.error('Error al limpiar el carrito:', error);
            alert('Error al limpiar el carrito');
        }
    };

    // Función para manejar la navegación a otra página (ruta de visita)
    const handleNavigation = () => {
        window.location.href = "/rutavisita"; // Redirige al usuario a la ruta de visita
      };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-4 text-lg">
            {/* Título con el número de lista que estamos viendo */}
            <h1 className="text-2xl font-bold text-center mb-4">
                Lista N° {tplisSeleccionado ?? 'Cargando...'}
            </h1>

            {/* Mostrar cliente seleccionado */}
            {clienteSeleccionado && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                    <p className="text-sm text-gray-600">
                        Cliente: <span className="font-semibold text-gray-800">{clienteSeleccionado} - {nombreCliente}</span>
                    </p>
                </div>
            )}

            {/* Campo de búsqueda para filtrar artículos */}
            <div className="relative">
                <input
                    type="text"
                    value={entradaBusqueda}
                    onChange={(e) => setEntradaBusqueda(e.target.value)}
                    placeholder="Buscar artículo por código o nombre"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Tabla de artículos */}
            <div className="h-[calc(100vh-300px)] w-full border border-gray-200 rounded-md overflow-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 text-left">Código</th>
                            <th className="p-2 text-left">Nombre</th>
                            <th className="p-2 text-left">Precio x Bulto</th>
                            <th className="p-2 text-left">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Mostramos un mensaje si no hay artículos */}
                        {articulosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-4 text-center text-gray-500">
                                    No se encontraron artículos
                                </td>
                            </tr>
                        ) : (
                            // Mapeamos cada artículo para mostrar una fila
                            articulosFiltrados.map((articulo) => {
                                // Usamos artic_pr como identificador único
                                const codigo = articulo.artic_pr;
                                // Verificamos si este artículo está en modo edición
                                const estaEditando = preciosEditables[codigo] !== undefined;
                                
                                return (
                                    <tr key={codigo} className="border-b border-gray-200 hover:bg-gray-50">
                                        {/* Columna del código del artículo */}
                                        <td className="p-2">{codigo}</td>
                                        
                                        {/* Columna del nombre (con abreviación si existe) */}
                                        <td className="p-2">
                                            <div>
                                                <div className="font-medium">{articulo.Articulos?.nombre || 'Sin nombre'}</div>
                                                {articulo.Articulos?.abrev && (
                                                    <div className="text-sm text-gray-500">({articulo.Articulos.abrev})</div>
                                                )}
                                            </div>
                                        </td>
                                        
                                        {/* Columna del precio - muestra input si está editando, sino muestra el precio */}
                                        <td className="p-2">
                                            {estaEditando ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={preciosEditables[codigo]}
                                                    onChange={(e) => manejarCambioPrecio(codigo, e.target.value)}
                                                    className="w-32 px-2 py-1 border border-gray-300 rounded-md"
                                                    autoFocus
                                                />
                                            ) : (
                                                <div>
                                                    <span className={`font-medium ${preciosPersonalizados[codigo] ? 'text-green-600' : ''}`}>
                                                        ${(preciosPersonalizados[codigo] || articulo.prec_bult)?.toFixed(2) || '0.00'}
                                                    </span>
                                                    {preciosPersonalizados[codigo] && (
                                                        <span className="ml-2 text-xs text-gray-500">
                                                            (Base: ${articulo.prec_bult?.toFixed(2)})
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        
                                        {/* Columna de acciones - botón de Guardar o Editar */}
                                        <td className="p-2">
                                            {estaEditando ? (
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => manejarGuardarPrecio(codigo)} 
                                                        className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-1"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        Guardar
                                                    </button>
                                                    {/* Botón para cancelar la edición */}
                                                    <button 
                                                        onClick={() => setPreciosEditables(prev => {
                                                            const nuevo = {...prev};
                                                            delete nuevo[codigo];
                                                            return nuevo;
                                                        })} 
                                                        className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => {
                                                        const precioActual = preciosPersonalizados[codigo] || articulo.prec_bult;
                                                        manejarCambioPrecio(codigo, precioActual?.toString() || '0');
                                                    }} 
                                                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
                                                >
                                                    Editar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal para ver el carrito de cambios */}
            {mostrarCarrito && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Carrito de Cambios de Precios</h2>
                            <button 
                                onClick={() => setMostrarCarrito(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {carritoCambios.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No hay cambios pendientes</p>
                        ) : (
                            <>
                                <div className="overflow-auto max-h-96">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="p-2 text-left">Cliente</th>
                                                <th className="p-2 text-left">Artículo</th>
                                                <th className="p-2 text-left">Precio Anterior</th>
                                                <th className="p-2 text-left">Precio Nuevo</th>
                                                <th className="p-2 text-left">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {carritoCambios.map((cambio, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="p-2">
                                                        <div className="text-xs">
                                                            {cambio.cliente_id}<br/>
                                                            <span className="text-gray-500">{cambio.cliente_nombre}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-2">
                                                        <div className="text-xs">
                                                            {cambio.articulo_id}<br/>
                                                            <span className="text-gray-500">{cambio.articulo_nombre}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-2">${cambio.precio_anterior?.toFixed(2)}</td>
                                                    <td className="p-2 font-semibold text-green-600">${cambio.precio_nuevo?.toFixed(2)}</td>
                                                    <td className="p-2">
                                                        {cambio.sincronizado ? (
                                                            <span className="text-green-600 text-xs">✓ Sincronizado</span>
                                                        ) : (
                                                            <span className="text-orange-600 text-xs">⏳ Pendiente</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div className="mt-4 flex gap-2 justify-end">
                                    <button 
                                        onClick={limpiarCarritoSincronizado}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                    >
                                        Limpiar Sincronizados
                                    </button>
                                    <button 
                                        onClick={sincronizarConSupabase}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                    >
                                        Sincronizar con Supabase
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <footer className="p-4 bg-muted">
                <div className="flex justify-between gap-2">
                    <button onClick={handleNavigation} className="bg-gray-300 p-3 text-sm rounded-lg hover:bg-gray-400 transition duration-200 flex items-center">
                        <LogOut className="mr-2 h-5 w-5" />
                        <span className="pl-1">Volver</span>
                    </button>
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setMostrarCarrito(true)}
                            className="bg-blue-500 text-white p-3 text-sm rounded-lg hover:bg-blue-600 transition duration-200 flex items-center relative"
                        >
                            <Menu className="mr-2 h-5 w-5" />
                            <span className="pl-1">Ver Carrito</span>
                            {carritoCambios.filter(c => !c.sincronizado).length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                    {carritoCambios.filter(c => !c.sincronizado).length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
