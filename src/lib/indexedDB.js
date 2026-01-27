import {openDB, deleteDB} from 'idb';

const dbName = 'Granix';
const dbVersion = 3;

let db; 

export async function eliminarBaseDeDatosCompleta() {
  try {
      await deleteDB(dbName);
      db = null; // Resetear la referencia
      console.log('Base de datos eliminada completamente.');
  } catch (error) {
      console.error('Error al eliminar la base de datos:', error);
  }
}

export async function setUpDataBase() {
    if (!db){
        db = await openDB(dbName,dbVersion, {
            upgrade(database, oldVersion, newVersion, transaction) {
            // Crear stores solo si no existen
            if (!database.objectStoreNames.contains('Vendedor')) {
                database.createObjectStore('Vendedor', { keyPath: 'numero' });
            }
            
            if (!database.objectStoreNames.contains('RutaDeVisita')) {
                database.createObjectStore('RutaDeVisita', { keyPath: 'id', autoIncrement: true });
            }
            /* if (!database.objectStoreNames.contains('RutaDeVisita')) {
                database.createObjectStore('RutaDeNoVisita', { keyPath: 'id', autoIncrement: true });
            } */
            
            if (!database.objectStoreNames.contains('ClienteSucursal')) {
                database.createObjectStore('ClienteSucursal', {keyPath : 'CODCL'});
            }
            
            if (!database.objectStoreNames.contains('Direccion')) {
                database.createObjectStore('Direccion', {keyPath : 'direccion_id'});
            }

            if (!database.objectStoreNames.contains('Precios')) {
                database.createObjectStore('Precios', { keyPath: 'TPLIS' });
            }

            if (!database.objectStoreNames.contains('CarritoCambiosPrecios')) {
                database.createObjectStore('CarritoCambiosPrecios', { keyPath: 'id', autoIncrement: true });
            }

            console.log('Base de datos creada o actualizada exitosamente.');
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

