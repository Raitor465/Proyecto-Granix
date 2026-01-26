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
            database.createObjectStore('Vendedor', { keyPath: 'numero' });
            
            database.createObjectStore('RutaDeVisita', { keyPath: 'id', autoIncrement: true });

            database.createObjectStore('RutaDeNoVisita', { keyPath: 'id', autoIncrement: true });

            database.createObjectStore('ClienteSucursal', {keyPath : 'CODCL'})
            
            database.createObjectStore('Direccion', {keyPath : 'direccion_id'})

            database.createObjectStore('Precios', { keyPath: 'TPLIS' });

            const pedidoStore = database.createObjectStore('Pedido', {keyPath: 'id', autoIncrement:true})
            pedidoStore.createIndex("clienteId","clienteId", {unique : true })
            

            console.log('Base de datos creada o abierta exitosamente.');
         },
        })
    }
    return db;
}
