import PouchDB from 'pouchdb';

// Definir la estructura del documento
interface MyDoc {
  _id: string;
  title: string;
  content: string;
}

// Inicializar la base de datos local y remota
export const localDB = new PouchDB<MyDoc>('my_database');
export const remoteDB = new PouchDB<MyDoc>('http://admin:admin@localhost:5984/my_database');

// Sincronización entre PouchDB y CouchDB (opcionalmente lo puedes manejar en el archivo principal)
localDB.sync(remoteDB, {
  live: true,
  retry: true,
}).on('change', (info) => {
  console.log('Sincronización completada', info);
}).on('error', (err) => {
  console.error('Error en la sincronización', err);
});

// Función para añadir un documento
export const addDocument = async () => {
  const doc: MyDoc = {
    _id: new Date().toISOString(), // Genera un ID único
    title: 'Documento desde PouchDB con TypeScript',
    content: 'Este documento será sincronizado con CouchDB',
  };

  try {
    const result = await localDB.put(doc); // Añadir el documento a PouchDB
    console.log('Documento añadido:', result);
  } catch (err) {
    console.error('Error al añadir documento:', err);
  }
};