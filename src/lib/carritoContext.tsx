/**
 * CONTEXTO DEL CARRITO UNIFICADO
 * 
 * Este archivo implementa un sistema de carrito global para manejar todos los cambios
 * pendientes de sincronización con Supabase (base de datos en la nube).
 * 
 * PROPÓSITO:
 * - Centralizar todos los cambios realizados en diferentes páginas
 * - Permitir sincronización masiva de datos a Supabase
 * - Gestionar errores y reintentos de sincronización
 * 
 * TIPOS DE DATOS QUE MANEJA:
 * - Pedidos (tomarpedido)
 * - Cambios de precios (registrarprecios)
 * - Cambios de ubicación (geocalizar)
 * - Actualización de datos del cliente (actualizardatos)
 * - Comprobantes de pago (solicitudpago)
 * - Registros de deuda (deuda)
 */

"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { setUpDataBase } from './indexedDB';
import { supabase } from './supabase';

// ==================== TIPOS DE DATOS ====================

/**
 * Tipo: Cambio de Precio
 * Se genera cuando el usuario modifica el precio de un artículo en "Registrar Precios"
 */
export type CambioPrecio = {
  id?: number;                    // ID autogenerado por IndexedDB
  tipo: 'precio';                 // Identificador del tipo de cambio
  cliente_id: number;             // CODCL del cliente
  cliente_nombre: string;         // Nombre del cliente para mostrar
  articulo_id: string;            // Código del artículo
  articulo_nombre: string;        // Nombre del artículo para mostrar
  precio_anterior: number;        // Precio original
  precio_nuevo: number;           // Precio modificado
  tplis: string;                  // Tipo de lista de precios
  fecha_modificacion: string;     // Timestamp del cambio
  sincronizado: boolean;          // Estado de sincronización
};

/**
 * Tipo: Pedido
 * Se genera cuando el usuario guarda un pedido en "Cargar Pedido"
 */
export type Pedido = {
  id?: number;
  tipo: 'pedido';
  cliente_id: number;
  cliente_nombre: string;
  items: any[];                   // Array de artículos del pedido
  total: number;                  // Total del pedido
  fecha: string;
  sincronizado: boolean;
};

/**
 * Tipo: Comprobante de Pago
 * Se genera cuando el usuario sube un comprobante en "Solicitud de Pago"
 */
export type ComprobantePago = {
  id?: number;
  tipo: 'comprobante_pago';
  cliente_id: number;              // Lo mantenemos en el tipo para mostrar en UI, pero no va a BD
  cliente_nombre: string;          // Para mostrar en el carrito
  deuda_id: number;                // <-- AHORA OBLIGATORIO (FK a Deudas.id)
  operacion: number;               // Número de operación (para referencia)
  tipo_factura: string;
  importe: number;
  fecha_vencimiento: string;
  filial: number;
  vendedor: number;
  archivo_data: ArrayBuffer;
  archivo_nombre: string;
  archivo_tipo: string;
  archivo_size: number;
  fecha: string;
  sincronizado: boolean;
};

/**
 * Tipo: Registro de Deuda
 * Se genera cuando se actualiza información de deudas en "Deuda Entidad"
 */
export type RegistroDeuda = {
  id?: number;
  tipo: 'registro_deuda';
  cliente_id: number;
  cliente_nombre: string;
  deuda_info: any;
  fecha: string;
  sincronizado: boolean;
};

/**
 * Tipo: Cambio de Ubicación
 * Se genera cuando el usuario actualiza la ubicación GPS en "Geocalizar"
 */
export type CambioUbicacion = {
  id?: number;
  tipo: 'ubicacion';
  cliente_id: number;
  cliente_nombre: string;
  latitud_anterior: number;
  longitud_anterior: number;
  latitud_nueva: number;
  longitud_nueva: number;
  fecha: string;
  sincronizado: boolean;
};

/**
 * Tipo: Actualización de Datos
 * Se genera cuando el usuario modifica información del cliente en "Actualizar Datos"
 */
export type ActualizacionDatos = {
  id?: number;
  tipo: 'actualizacion_datos';
  cliente_id: number;
  cliente_nombre: string;
  datos_anteriores: any;          // Estado anterior de los datos
  datos_nuevos: any;              // Estado nuevo de los datos
  fecha: string;
  sincronizado: boolean;
};

// Union type que combina todos los tipos de items posibles en el carrito
export type ItemCarrito = CambioPrecio | Pedido | ComprobantePago | RegistroDeuda | CambioUbicacion | ActualizacionDatos;

// ==================== CONTEXTO ====================

/**
 * Interfaz del contexto que define las funciones disponibles
 */
type CarritoContextType = {
  carrito: ItemCarrito[];                                 // Array de todos los items pendientes
  agregarItem: (item: ItemCarrito) => Promise<void>;      // Agregar un nuevo item
  eliminarItem: (id: number) => Promise<void>;            // Eliminar un item por ID
  obtenerItemsPorCliente: () => Map<number, ItemCarrito[]>; // Agrupar items por cliente
  sincronizarTodo: () => Promise<void>;                   // Sincronizar todo con Supabase
  cargarCarrito: () => Promise<void>;                     // Recargar items desde IndexedDB
  limpiarCarrito: () => Promise<void>;                    // Vaciar el carrito completamente
};

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

/**
 * PROVEEDOR DEL CONTEXTO
 * Componente que envuelve la aplicación y proporciona acceso al carrito
 * Se usa en layout.tsx para estar disponible en toda la app
 */
export function CarritoProvider({ children }: { children: React.ReactNode }) {
  // Estado que mantiene todos los items del carrito en memoria
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

  /**
   * Effect que carga el carrito al iniciar la aplicación
   * Se ejecuta una sola vez cuando el componente se monta
   */
  useEffect(() => {
    cargarCarrito();
  }, []);

  /**
   * Función: cargarCarrito
   * Carga todos los items del carrito desde IndexedDB a la memoria
   */
  const cargarCarrito = async () => {
    try {
      const db = await setUpDataBase();
      const tx = db.transaction('CarritoCambiosPrecios', 'readonly');
      const store = tx.objectStore('CarritoCambiosPrecios');
      const items = await store.getAll();
      setCarrito(items);
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
    }
  };

  /**
   * Función: agregarItem
   * Agrega un nuevo item al carrito tanto en IndexedDB como en memoria
   * 
   * @param item - El item a agregar (puede ser pedido, cambio de precio, etc.)
   */
  const agregarItem = async (item: ItemCarrito) => {
    try {
      const db = await setUpDataBase();
      const tx = db.transaction('CarritoCambiosPrecios', 'readwrite');
      const store = tx.objectStore('CarritoCambiosPrecios');
      const id = await store.add(item); // IndexedDB genera el ID automáticamente
      await tx.done;

      // Actualizar el estado en memoria con el ID generado
      setCarrito(prev => [...prev, { ...item, id: id as number }]);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      throw error;
    }
  };

  /**
   * Función: eliminarItem
   * Elimina un item del carrito por su ID (útil cuando el usuario hace clic en X)
   * 
   * @param id - ID del item a eliminar
   */
  const eliminarItem = async (id: number) => {
    try {
      const db = await setUpDataBase();
      const tx = db.transaction('CarritoCambiosPrecios', 'readwrite');
      const store = tx.objectStore('CarritoCambiosPrecios');
      await store.delete(id);
      await tx.done;

      // Actualizar el estado filtrando el item eliminado
      setCarrito(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error al eliminar del carrito:', error);
      throw error;
    }
  };

  /**
   * Función: obtenerItemsPorCliente
   * Agrupa todos los items del carrito por cliente
   * 
   * @returns Map donde la clave es el cliente_id y el valor es un array de sus items
   * 
   * Ejemplo de retorno:
   * Map {
   *   12345 => [pedido1, cambio_precio1, ubicacion1],
   *   67890 => [pedido2, actualizacion_datos1]
   * }
   */
  const obtenerItemsPorCliente = () => {
    const porCliente = new Map<number, ItemCarrito[]>();

    carrito.forEach(item => {
      const clienteId = item.cliente_id;
      if (!porCliente.has(clienteId)) {
        porCliente.set(clienteId, []);
      }
      porCliente.get(clienteId)!.push(item);
    });

    return porCliente;
  };

  /**
   * Función: sincronizarTodo
   * Función principal que sincroniza todos los items del carrito con Supabase
   * 
   * FLUJO DE SINCRONIZACIÓN:
   * 1. Itera cada item del carrito uno por uno
   * 2. Según el tipo de item, hace el insert/update correspondiente en Supabase
   * 3. Si el item se guarda exitosamente, lo marca como exitoso
   * 4. Si falla, lo agrega a la lista de fallidos con el mensaje de error
   * 5. Al finalizar:
   *    - Si TODO fue exitoso: limpia el carrito completamente
   *    - Si hubo errores: elimina solo los exitosos y muestra los fallidos
   *    - Si hay error de conexión: no modifica nada
   * 
   * MANEJO DE ERRORES:
   * - Cada item se procesa independientemente (un error no detiene los demás)
   * - Los errores se capturan y se muestran al usuario con detalles
   * - Se mantiene un log en consola para debugging
   */
  const sincronizarTodo = async () => {
    // Validación inicial: no hacer nada si el carrito está vacío
    if (carrito.length === 0) {
      alert('No hay elementos en el carrito para sincronizar');
      return;
    }

    // Arrays para trackear el resultado de cada sincronización
    const exitosos: ItemCarrito[] = [];
    const fallidos: Array<{ item: ItemCarrito; error: string }> = [];

    try {
      // Procesar cada item del carrito uno por uno (no en paralelo)
      for (const item of carrito) {
        try {
          console.log('Sincronizando item:', item.tipo, item);

          // Switch para determinar qué hacer según el tipo de item
          switch (item.tipo) {
            case 'pedido':
              // CASO 1: Guardar pedido en la tabla "pedidos" de Supabase
              const { data: dataPedido, error: errorPedido } = await supabase
                .from('pedidos')
                .insert({
                  cliente_id: item.cliente_id,
                  items: item.items,
                  total: item.total,
                  fecha: item.fecha
                });

              if (errorPedido) {
                console.error('Error al guardar pedido:', errorPedido);
                throw new Error(errorPedido.message || JSON.stringify(errorPedido));
              }
              break;

            case 'precio':
              // CASO 2: Guardar/actualizar precio en la tabla "precios_clientes"
              // upsert: inserta si no existe, actualiza si ya existe
              const { data: dataPrecio, error: errorPrecio } = await supabase
                .from('precios_clientes')
                .upsert({
                  cliente_id: item.cliente_id,
                  articulo_id: item.articulo_id,
                  precio: item.precio_nuevo,
                  tplis: item.tplis
                }, {
                  onConflict: 'cliente_id,articulo_id' // Clave compuesta para detectar duplicados
                });

              if (errorPrecio) {
                console.error('Error al guardar precio:', errorPrecio);
                throw new Error(errorPrecio.message || JSON.stringify(errorPrecio));
              }
              break;

            case 'ubicacion':
              // CASO 3: Actualizar latitud y longitud del cliente en la tabla ubicacion
              const { data: dataUbicacion, error: errorUbicacion } = await supabase
                .from('ubicacion')
                .update({
                  latitude: item.latitud_nueva,
                  longitude: item.longitud_nueva
                })
                .eq('id', item.cliente_id);

              if (errorUbicacion) {
                console.error('Error al actualizar ubicación:', errorUbicacion);
                throw new Error(errorUbicacion.message || JSON.stringify(errorUbicacion));
              }
              break;

            case 'actualizacion_datos':
              // CASO 4: Actualizar información general del cliente
              // Solo actualizamos las columnas que existen en la tabla
              const updateData: any = {};
              if (item.datos_nuevos.telefono !== undefined) updateData.telefono = item.datos_nuevos.telefono;
              if (item.datos_nuevos.email !== undefined) updateData.email = item.datos_nuevos.email;
              if (item.datos_nuevos.notas !== undefined) updateData.notas = item.datos_nuevos.notas;
              if (item.datos_nuevos.orden_visita !== undefined) updateData.orden_visita = item.datos_nuevos.orden_visita;

              const { data: dataDatos, error: errorDatos } = await supabase
                .from('ClienteSucursal')
                .update(updateData)
                .eq('CODCL', item.cliente_id);

              if (errorDatos) {
                console.error('Error al actualizar datos:', errorDatos);
                throw new Error(errorDatos.message || JSON.stringify(errorDatos));
              }
              break;

            case 'comprobante_pago':
              console.log('Sincronizando comprobante de pago:', item);

              // 1. Subir archivo a Supabase Storage
              const fileName = `comprobantes/${Date.now()}_${item.archivo_nombre}`;
              const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('pagos')
                .upload(fileName, item.archivo_data, {
                  contentType: item.archivo_tipo
                });

              if (uploadError) {
                console.error('Error al subir archivo:', uploadError);
                throw new Error(`Error al subir archivo: ${uploadError.message}`);
              }

              // 2. Obtener URL pública
              const { data: { publicUrl } } = supabase
                .storage
                .from('pagos')
                .getPublicUrl(fileName);

              // 3. Crear registro en comprobantes_pago
              const { error: errorComprobante } = await supabase
                .from('comprobantes_pago')
                .insert({
                  deuda_id: item.deuda_id,
                  operacion: item.operacion,
                  archivo_nombre: item.archivo_nombre,
                  archivo_url: publicUrl,
                  fecha: item.fecha,
                  estado: 'pendiente'
                });

              if (errorComprobante) {
                console.error('Error al guardar comprobante:', errorComprobante);
                throw new Error(errorComprobante.message || JSON.stringify(errorComprobante));
              }

              // 4. ACTUALIZAR la deuda a estado "comprobante_pendiente" en Supabase
              console.log('Intentando actualizar deuda:', {
              deuda_id: item.deuda_id,
              operacion: item.operacion,
              tipo: typeof item.deuda_id
            });
              const { error: errorUpdateDeuda } = await supabase
                .from('Deudas')
                .update({ estado_pago: 'comprobante_pendiente' })
                .eq('id', item.deuda_id);

              if (errorUpdateDeuda) {
                console.error('Error al actualizar deuda:', errorUpdateDeuda);
                throw new Error(`Error al actualizar deuda: ${errorUpdateDeuda.message}`);
              }

              // 5. ACTUALIZAR IndexedDB para que la próxima vez aparezca como pendiente
              try {
                const db = await setUpDataBase();
                const tx = db.transaction('ClienteSucursal', 'readwrite');
                const store = tx.objectStore('ClienteSucursal');

                // Obtener el cliente
                const clientes = await store.getAll();
                const cliente = clientes[0];

                if (cliente && cliente.deudas) {
                  // Actualizar la deuda específica
                  const deudasActualizadas = cliente.deudas.map((deuda: any) => {
                    if (deuda.id === item.deuda_id) {
                      return { ...deuda, estado_pago: 'comprobante_pendiente' };
                    }
                    return deuda;
                  });

                  // Guardar el cliente actualizado
                  await store.put({
                    ...cliente,
                    deudas: deudasActualizadas
                  });
                }

                await tx.done;
                console.log('Deuda actualizada en IndexedDB');
              } catch (error) {
                console.error('Error actualizando IndexedDB:', error);
                // No lanzamos error para no romper la sincronización
              }

              console.log('Comprobante guardado y deuda actualizada');
              break;
            case 'registro_deuda':
              // CASO 6: Guardar información de deuda
              const { data: dataDeuda, error: errorDeuda } = await supabase
                .from('deudas')
                .insert({
                  cliente_id: item.cliente_id,
                  deuda_info: item.deuda_info,
                  fecha: item.fecha
                });

              if (errorDeuda) {
                console.error('Error al guardar deuda:', errorDeuda);
                throw new Error(errorDeuda.message || JSON.stringify(errorDeuda));
              }
              break;
          }

          // Si llegó aquí sin lanzar error, el item se sincronizó correctamente
          console.log('Item sincronizado exitosamente:', item.tipo);
          exitosos.push(item);
        } catch (error: any) {
          // Capturar error específico de este item y continuar con los demás
          console.error('Error al sincronizar item:', error);
          fallidos.push({
            item,
            error: error.message || error.toString() || 'Error desconocido'
          });
        }
      }

      // FASE 2: Procesar resultados

      if (fallidos.length === 0) {
        // ✅ CASO EXITOSO: Todo se sincronizó correctamente
        await limpiarCarrito();
        // Limpiar clientes con errores de sessionStorage
        sessionStorage.removeItem('clientesConError');
        alert(`✅ Sincronización completada exitosamente.\n${exitosos.length} elementos guardados.`);
      } else {
        // ⚠️ CASO PARCIAL: Algunos fallaron, otros no
        // Eliminar solo los items que se guardaron exitosamente
        const db = await setUpDataBase();

        // Eliminar del carrito de cambios
        const txCarrito = db.transaction('CarritoCambiosPrecios', 'readwrite');
        const storeCarrito = txCarrito.objectStore('CarritoCambiosPrecios');

        for (const itemExitoso of exitosos) {
          if (itemExitoso.id) {
            await storeCarrito.delete(itemExitoso.id);
          }
        }
        await txCarrito.done;

        // Eliminar pedidos de los clientes sincronizados exitosamente
        const clientesExitosos = exitosos
          .filter(item => item.tipo === 'pedido')
          .map(item => item.cliente_id);

        if (clientesExitosos.length > 0) {
          const txPedido = db.transaction('Pedido', 'readwrite');
          const storePedido = txPedido.objectStore('Pedido');
          const todosPedidos = await storePedido.getAll();

          for (const pedido of todosPedidos) {
            if (clientesExitosos.includes(pedido.clienteId)) {
              await storePedido.delete(pedido.id);
            }
          }
          await txPedido.done;
        }

        // Recargar el carrito desde IndexedDB (solo quedan los fallidos)
        await cargarCarrito();

        // Guardar clientes con errores en sessionStorage
        const clientesConError = Array.from(new Set(fallidos.map(f => f.item.cliente_id)));
        sessionStorage.setItem('clientesConError', JSON.stringify(clientesConError));

        // Construir mensaje detallado de errores
        const mensajeErrores = fallidos.map(f =>
          `- ${f.item.cliente_nombre} (${f.item.tipo}): ${f.error}`
        ).join('\n');

        alert(
          `⚠️ Sincronización parcial:\n` +
          `✅ Exitosos: ${exitosos.length}\n` +
          `❌ Fallidos: ${fallidos.length}\n\n` +
          `Elementos que no se pudieron sincronizar:\n${mensajeErrores}\n\n` +
          `Los elementos exitosos fueron eliminados del carrito.`
        );
      }

    } catch (error: any) {
      // ❌ ERROR CRÍTICO: Error de conexión o error inesperado
      // No se modifica nada para que el usuario pueda reintentar
      console.error('Error durante la sincronización:', error);
      alert(
        '❌ Error de conexión durante la sincronización.\n' +
        'No se realizaron cambios en el carrito.\n' +
        'Error: ' + (error.message || error.toString()) + '\n' +
        'Por favor, verifica tu conexión a internet e intenta nuevamente.'
      );
    }
  };

  /**
   * Función: limpiarCarrito
   * Elimina TODOS los items del carrito (tanto de IndexedDB como de memoria)
   * 
   * USO: Se llama automáticamente cuando la sincronización es 100% exitosa
   * También se puede usar manualmente si se quiere resetear el carrito
   */
  const limpiarCarrito = async () => {
    try {
      const db = await setUpDataBase();

      // Limpiar carrito de cambios
      const txCarrito = db.transaction('CarritoCambiosPrecios', 'readwrite');
      const storeCarrito = txCarrito.objectStore('CarritoCambiosPrecios');
      await storeCarrito.clear();
      await txCarrito.done;

      // Limpiar pedidos después de sincronización exitosa
      const txPedido = db.transaction('Pedido', 'readwrite');
      const storePedido = txPedido.objectStore('Pedido');
      await storePedido.clear();
      await txPedido.done;

      setCarrito([]); // Limpia el estado en memoria
    } catch (error) {
      console.error('Error al limpiar el carrito:', error);
      throw error;
    }
  };

  // Proveer todas las funciones y datos a través del contexto
  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarItem,
        eliminarItem,
        obtenerItemsPorCliente,
        sincronizarTodo,
        cargarCarrito,
        limpiarCarrito,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

/**
 * Hook personalizado: useCarrito
 * Proporciona acceso fácil al contexto del carrito desde cualquier componente
 * 
 * USO:
 * const { carrito, agregarItem, sincronizarTodo } = useCarrito();
 * 
 * IMPORTANTE: Solo funciona dentro de componentes envueltos por CarritoProvider
 */
export function useCarrito() {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
  }
  return context;
}
