// Importación de la librería idb para trabajar con IndexedDB de forma más sencilla
import {openDB, deleteDB} from 'idb';

// Nombre de la base de datos local
const dbName = 'Granix';

// IMPORTANTE: Se incrementó la versión de 1 a 2 para agregar el nuevo object store 'CarritoCambiosPrecios'
// Al cambiar la versión, se ejecuta la función upgrade que crea las tablas faltantes
const dbVersion = 2;

// Variable global que mantiene la conexión a la base de datos
let db; 

/**
 * Función para eliminar completamente la base de datos local
 * Útil para resetear datos o solucionar problemas de corrupción
 */
export async function eliminarBaseDeDatosCompleta() {
  try {
      await deleteDB(dbName);
      db = null; // Resetear la referencia
      console.log('Base de datos eliminada completamente.');
  } catch (error) {
      console.error('Error al eliminar la base de datos:', error);
  }
}

/**
 * Función principal para configurar y abrir la base de datos IndexedDB
 * Esta función se ejecuta la primera vez y cuando hay cambios de versión
 * 
 * Flujo:
 * 1. Si la DB ya existe (db != null), la retorna directamente
 * 2. Si no existe o cambió la versión, ejecuta el upgrade
 * 3. El upgrade verifica cada object store antes de crearlo (evita errores)
 */
export async function setUpDataBase() {
    if (!db){
        db = await openDB(dbName,dbVersion, {
            upgrade(database) {
            // Validación: Solo crea el object store si NO existe
            // Esto previene errores cuando se actualiza la versión de la BD
            if (!database.objectStoreNames.contains('Vendedor')) {
                database.createObjectStore('Vendedor', { keyPath: 'numero' });
            }
            
            if (!database.objectStoreNames.contains('RutaDeVisita')) {
                database.createObjectStore('RutaDeVisita', { keyPath: 'id', autoIncrement: true });
            }

            if (!database.objectStoreNames.contains('RutaDeNoVisita')) {
                database.createObjectStore('RutaDeNoVisita', { keyPath: 'id', autoIncrement: true });
            }

            if (!database.objectStoreNames.contains('ClienteSucursal')) {
                database.createObjectStore('ClienteSucursal', {keyPath : 'CODCL'})
            }
            
            if (!database.objectStoreNames.contains('Direccion')) {
                database.createObjectStore('Direccion', {keyPath : 'direccion_id'})
            }

            if (!database.objectStoreNames.contains('Precios')) {
                database.createObjectStore('Precios', { keyPath: 'TPLIS' });
            }

            if (!database.objectStoreNames.contains('Pedido')) {
                const pedidoStore = database.createObjectStore('Pedido', {keyPath: 'id', autoIncrement:true})
                // Índice para buscar pedidos por cliente rápidamente
                pedidoStore.createIndex("clienteId","clienteId", {unique : true })
            }
            
            // NUEVO: Object store para el carrito unificado de cambios
            // Almacena todos los cambios pendientes de sincronizar (pedidos, precios, ubicaciones, etc.)
            if (!database.objectStoreNames.contains('CarritoCambiosPrecios')) {
                database.createObjectStore('CarritoCambiosPrecios', { keyPath: 'id', autoIncrement: true });
            }
            console.log('Base de datos creada o abierta exitosamente.');
         },
        })
    }
    return db;
}


// Función genérica para obtener todos los registros de una tabla
export async function getAllFromStore(storeName) {
    const database = await setUpDataBase();
    const tx = database.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return store.getAll();
  }
  
// Función para agregar un registro a un store
export async function addRecord(storeName, record) {
    const database = await setUpDataBase();
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.add(record);
    await tx.done;
    console.log(`Registro agregado a ${storeName}:`, record);
  }
  
  // Función para actualizar un registro existente
export async function updateRecord(storeName, record) {
    const database = await setUpDataBase();
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.put(record);
    await tx.done;
    console.log(`Registro actualizado en ${storeName}:`, record);
  }
  
  // Función para eliminar un registro
export async function deleteRecord(storeName, key) {
    const database = await setUpDataBase();
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.delete(key);
    await tx.done;
    console.log(`Registro eliminado de ${storeName}:`, key);
  }

