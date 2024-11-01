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
    if (!db){
        db = await openDB(dbName,dbVersion, {
            upgrade(database) {
            const vendedorStore = database.createObjectStore('Vendedor', { keyPath: 'numero' });
            vendedorStore.createIndex('sincronizado','sincronizado',{unique: false});
            vendedorStore.createIndex('clave','clave',{unique: false});

            const provinciaStore = database.createObjectStore('Provincia', {keyPath : 'provincia_id'})
            provinciaStore.createIndex('nombre', 'nombre',{unique: true});
            
            const localidadStore = database.createObjectStore('Localidad', {keyPath : 'localidad_id'})
            localidadStore.createIndex('nombre','nombre',{unique: true});
            localidadStore.createIndex('provincia_id','provincia_id',{unique:false});

            const zonaStore = database.createObjectStore('Zona', {keyPath : 'zona_id'})
            zonaStore.createIndex('nombre','nombre',{unique: true});
            zonaStore.createIndex('barrio','barrio',{unique: true});
            zonaStore.createIndex('localidad_id','localidad_id',{unique:false});

            const rutavisitaStore = database.createObjectStore('Zona', {keyPath : 'ruta_visita_id'})
            rutavisitaStore.createIndex('dia','dia',{unique: true});
            rutavisitaStore.createIndex('vendedor_id','vendedor_id',{unique: false});
            rutavisitaStore.createIndex('zona_id','zona_id',{unique:false});


            //vendedorStore.createIndex('contraseña','contraseña',{unique: false});
            // database.createObjectStore('Zona', { keyPath: 'zona_id' });
            // database.createObjectStore('RutaVisita', { keyPath: 'ruta_visita_id' });
            // database.createObjectStore('Articulo', { keyPath: 'articulo_id' });
            // database.createObjectStore('Cliente', { keyPath: 'cliente_id' });
            // database.createObjectStore('Deuda', { keyPath: 'deuda_id' });
            // database.createObjectStore('Direccion', { keyPath: 'direccion_id' });
            // database.createObjectStore('Localidad', { keyPath: 'localidad_id' });
            // database.createObjectStore('Provincia', { keyPath: 'provincia_id' });
            // database.createObjectStore('Frecuencia', { keyPath: 'frecuencia_id' });
            // database.createObjectStore('Categoria', { keyPath: 'categoria_id' });
            // database.createObjectStore('Bonificacion', { keyPath: 'bonificacion_id' });
            // database.createObjectStore('ListaArticulos', { keyPath: 'lista_articulos_id' });
            console.log('Base de datos creada o abierta exitosamente.');
         },
        })
    }
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

