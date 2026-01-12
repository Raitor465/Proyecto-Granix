import {openDB, deleteDB} from 'idb';

const dbName = 'Granix';
const dbVersion = 1;

let db; 

export async function eliminarBaseDeDatosCompleta() {
  try {
      await deleteDB(dbName);
      console.log('Base de datos eliminada completamente.');
  } catch (error) {
      console.error('Error al eliminar la base de datos:', error);
  }
}

export async function setUpDataBase() {
    // Siempre reabrir la base de datos para asegurar datos frescos
    if (db) {
        db.close();
        db = null;
    }
    
    db = await openDB(dbName,dbVersion, {
        upgrade(database) {
        database.createObjectStore('Vendedor', { keyPath: 'numero' });
        
        database.createObjectStore('RutaDeVisita', { keyPath: 'id', autoIncrement: true });
        
        database.createObjectStore('ClienteSucursal', {keyPath : 'CODCL'})
        
        database.createObjectStore('Direccion', {keyPath : 'direccion_id'})

        database.createObjectStore('Precios', { keyPath: 'TPLIS' });

        console.log('Base de datos creada o abierta exitosamente.');
     },
    })
    
    return db;
}


// Función genérica para obtener todos los registros de una tabla
export async function getAllFromStore(storeName) {
    const database = await setupDatabase();
    const tx = database.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return store.getAll();
  }
  
// Función para agregar un registro a un store
export async function addRecord(storeName, record) {
    const database = await setupDatabase();
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.add(record);
    await tx.done;
    console.log(`Registro agregado a ${storeName}:`, record);
  }
  
  // Función para actualizar un registro existente
export async function updateRecord(storeName, record) {
    const database = await setupDatabase();
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.put(record);
    await tx.done;
    console.log(`Registro actualizado en ${storeName}:`, record);
  }
  
  // Función para eliminar un registro
export async function deleteRecord(storeName, key) {
    const database = await setupDatabase();
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.delete(key);
    await tx.done;
    console.log(`Registro eliminado de ${storeName}:`, key);
  }

