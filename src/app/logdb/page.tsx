"use client"

import React, { useState, useEffect, ChangeEvent } from 'react';
import { setUpDataBase, eliminarBaseDeDatosCompleta } from '../../lib/indexedDB'
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useVendedor } from '@/lib/vendedorContext';


async function MirarVendedores() {
  const db = await setUpDataBase();
  const tx = db.transaction('Vendedor', 'readonly');
  // console.log(tx.store) 
  const vendedores = await tx.store.getAll(); // Obtiene todos los vendedores
  // console.log(vendedores)
  tx.done;

  // Para eliminar el primer id del vendedor
  // const tx = db.transaction('Vendedor','readwrite');
  //await tx.store.delete(1)
}

export async function guardarVendedorLocal(vendedor: any) {
  try {
    const db = await setUpDataBase();
    const tx = db.transaction('Vendedor', 'readwrite');
    // tx.store.clear();
    await tx.store.put(vendedor);
    await tx.done

    console.log('Vendedor guardado localmente');
  } catch (error) {
    console.error('Error al guardar el vendedor', error)
  }
}

const TestConnectionButton = () => {
  const [isTesting, setIsTesting] = useState(false);

  const testConnection = async () => {
    if (isTesting) return;

    setIsTesting(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', 37)
        .limit(10);
      console.log(data)
      if (error) {
        console.error('Error de conexión:', error);
        alert('Error al conectar con Supabase: ' + error.message);
      } else {
        console.log('Conexión exitosa');
        alert('Conexión exitosa con Supabase!');
      }
    } catch (err) {
      if (err instanceof Error) {
        alert('Error: ' + err.message);
      }
      console.error('Error:', err);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <button
      onClick={testConnection}
      disabled={isTesting}
      className="mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
    >
      {isTesting ? 'Probando...' : 'Probar Conexión'}
    </button>
  );
};

interface Vendedor {
  numero: number,
  clave: string
}


const login = async (numero: any, clave: any) => {
  try {
    const { data: vendedorbext, error } = await supabase
      .from('vendedores')
      .select('*')
      .eq('numero', numero)
      .eq('clave', clave)
      .single();


    if (error) throw error;
    if (vendedorbext) {
      const vendedorl = {
        numero: vendedorbext.numero,
        sincronizado: true,
        clave: vendedorbext.clave,
      }
      // setVendedorId(vendedorbext.numero)
      //setVendedor(vendedorbext.numero);

      //setVendedorId(vendedorbext.numero); // Cambia esto a vendedorId si es necesario

      await guardarVendedorLocal(vendedorl);

      return vendedorbext;
    }
  } catch (error) {
    console.error('Error durante el login', error);
    alert('Ocurrió un erorr al iniciar sesión');

  }

}


const OfflineFirstForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    //vendedor_id: '',
    numero: '',
    clave: ''
  });
  const { setVendedorId } = useVendedor();
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  // const [lastSync, setLastSync] = useState(null);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // if (sessionStorage.getItem('isLoggedIn') === 'true') {
    //   router.push('/crearruta'); // Redirige a CrearRuta
    // }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveData = async (e: React.FormEvent) => {
    e.preventDefault();

    // const now = new Date().toISOString();
    const data = {
      numero: Number(formData.numero), // Asegúrate de que sea un número
      clave: formData.clave,
      // email: formData.email,
      //created_at: now,
      //sincronizado: false
    };

    try {
      const vendedor = await login(data.numero, data.clave);
      // console.log(vendedor)
      if (vendedor) {
        alert('Datos guardados correctamente')
        //console.log(data.numero)
        const { data: rutaVisita, error } = await supabase
          .from('ClienteSucursal')
          .select(`
          nombre,orden_visita,CODCL,            
          RutaDeVisita:ruta_visita_id(nombre,ruta_visita_id),
          Direccion(calle,numero),
          lista, 
          email, 
          notas, 
          telefono, 
          entrega_observaciones
        `)
          .eq('ruta_visita_id.numero_vend', data.numero)
          .not('RutaDeVisita', 'is', null) // Asegura que RutaDeVisita no sea null
        // .eq('Deudas.cliente', 'ClienteSucursal.CODCL'); // Relaciona las deudas con el cliente usando CODCL
        if (error) throw new Error(error.message);
        // console.log(rutaVisita);
        // Preparar todas las deudas antes de la transacción
        const clientesConDeudas = [];
        const listas: number[] = [];
        for (const cliente of rutaVisita) {
          if (cliente.lista && !listas.includes(cliente.lista)) listas.push(cliente.lista);
          //En esta parte quiero poner las listas que todavia no estan en la lista Listas
          const { data: deudas, error: deudasError } = await supabase
            .from('Deudas')
            .select(`*`)
            .eq('cliente', cliente.CODCL);

          if (deudasError) throw new Error(deudasError.message);

          // Agregar las deudas al cliente para almacenar en IndexedDB después
          clientesConDeudas.push({ ...cliente, deudas });

        }
        try {
          // Primero, consultar las listas de artículos desde Supabase, filtradas por los números de lista presentes en 'listas'
          if (listas.length > 0) {
            const listasConArticulos = [];

            for (const lista of listas) {
              const { data: articulosEnLista, error } = await supabase
                .from('Articulos')
                .select(`
               *,
               ListaArticulos!inner( nro_lista )
             `) 
                .eq('ListaArticulos.nro_lista', lista); 
              //  console.log(articulosEnLista)
              const { data: nombreListaData, error: nombreListaError } = await supabase
                .from('Lista')
                .select('nombre')
                .eq('id', lista)  // Filtrar por el nro_lista
                .single();  // Solo esperamos un único resultado, ya que cada lista tiene un solo nombre

              if (nombreListaError) {
                throw new Error(`Error al obtener el nombre de la lista ${lista}: ${nombreListaError.message}`);
              }

              // Crear un objeto para almacenar la lista con su nombre y los artículos
              listasConArticulos.push({
                nro_lista: lista,
                nombre: nombreListaData.nombre,
                articulos: articulosEnLista
              });
            }
            // console.log(listasConArticulos)

            // Abre la base de datos de IndexedDB
            const db = await setUpDataBase();  

            // Inicia una transacción para guardar las listas en la store 'Listas'
            const tx = db.transaction('ListaArticulos', 'readwrite');  // Usamos 'Listas' como store para las listas
            // Guardar cada lista con los artículos en IndexedDB
            for (const listaData of listasConArticulos) {
              // Guardar en IndexedDB con la estructura correspondiente
              await tx.objectStore('ListaArticulos').put(listaData);
            }

            // Esperar a que la transacción se complete
            await tx.done;

            console.log("Listas guardadas en IndexedDB:", listasConArticulos);
          } else {
            console.log("No hay listas disponibles para consultar.");
          }

        } catch (error) {
          console.error("Error al guardar listas en IndexedDB:", error);
        }

        // console.log(listas)
        // Abre la base de datos y comienza la transacción después de obtener todos los datos
        const db = await setUpDataBase();
        const tx = db.transaction('RutaDeVisita', 'readwrite');
        const store = tx.objectStore('RutaDeVisita');
        await store.clear();
        
        // Guardar cada cliente y sus deudas en IndexedDB
        for (const cliente of clientesConDeudas) {
          // Guardar cliente en la store 'RutaDeVisita'
          await tx.objectStore('RutaDeVisita').put(cliente);
        }

        await tx.done; // Esperar a que se complete la transacción


        setFormData({ numero: '', clave: '' });
        //setIsLoggedIn(true)


        sessionStorage.setItem('isLoggedIn', 'true');
        // router.push('/crearruta');
      }

      // await eliminarBaseDeDatosCompleta()
    } catch (error) {
      if (error instanceof Error) {
        alert('Error al guardar los datos: ' + error.message);
      }
      console.error('Error al guardar datos:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Formulario Offline-First con Supabase</h2>
      <form onSubmit={saveData} className="space-y-4">
        <div>
          <label htmlFor="numero" className="block mb-1">Número:</label>
          <input
            type="text"
            id="numero"
            name="numero"
            value={formData.numero}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="clave" className="block mb-1">Clave:</label>
          <input
            type="password"
            id="clave"
            name="clave"
            value={formData.clave}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={isSyncing}
        >
          {isSyncing ? 'Sincronizando...' : 'Guardar'}
        </button>
      </form>

      <p className="mt-4">
        Estado: <span className={`font-bold ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
          {isOnline ? 'En línea' : 'Fuera de línea'}
        </span>
      </p>
      <TestConnectionButton />
    </div>
  );
};

export default OfflineFirstForm;