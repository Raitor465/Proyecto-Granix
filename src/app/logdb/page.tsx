'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import {setUpDataBase, eliminarBaseDeDatosCompleta} from '../../lib/indexedDB'
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useVendedor } from '@/lib/vendedorContext';


type ArticuloConPrecio = {
  prec_bult: number;
  NULIS: number;
  // Articulos: {
  //   nombre: string;
  //   abrev: string;
  // };
};


async function MirarVendedores(){
  const db = await setUpDataBase();
  const tx = db.transaction('Vendedor','readonly');
  const vendedores = await tx.store.getAll(); // Obtiene todos los vendedores
  tx.done;             
}

export async function guardarVendedorLocal(vendedor: any){
  try{
    const db = await setUpDataBase();
    const tx = db.transaction('Vendedor','readwrite');
    await tx.store.put(vendedor);
    await tx.done

    console.log('Vendedor guardado localmente');
  }catch(error){
    console.error('Error al guardar el vendedor',error)
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
        .eq('id',37)
        .limit(10);
      console.log(data)
      if (error) {
        console.error('Error de conexión:', error);
        alert('Error al conectar con Supabase: ' + error.message);
      } else {
        console.log('Conexión exitosa');
        alert('Conexión exitosa con Supabase!');
      }
    } catch (err ) {
      if ( err instanceof Error){
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

interface Vendedor{
  numero : number,
  clave : string
}


const login = async(numero : any , clave : any) => {
  try {
      const {data: vendedorbext , error} = await supabase
      .from('vendedores')
      .select('*')
      .eq('numero',numero)
      .eq('clave',clave)
      .single();

      //console.log('Número:', numero);
      //console.log('Clave:', clave);
      //console.log(vendedor)

      if (error) throw error;
      if (vendedorbext){
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
  }catch(error){
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
  //const { setVendedorId } = useVendedor();
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  // const [lastSync, setLastSync] = useState(null);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (sessionStorage.getItem('isLoggedIn') === 'true') {
      router.push('/menu'); // Redirige a CrearRuta
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  const handleInputChange = (e : ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const saveData = async (e: React.FormEvent) => {
  e.preventDefault();

  const data = {
    numero: Number(formData.numero),
    clave: formData.clave,
  };

  try {
    const vendedor = await login(data.numero, data.clave);
    if (!vendedor) return;

    alert('Datos guardados correctamente');

    const { data: rutaVisita, error } = await supabase
      .from('ClienteSucursal')
      .select(`
        nombre, orden_visita, CODCL, TPLIS,
        RutaDeVisita:ruta_visita_id(nombre, ruta_visita_id, dia),
        Direccion(calle, numero, latitud, longitud),
        email, notas, telefono, entrega_observaciones,
        Bonificaciones:CODCA (CODCA_bon,BG_porc),
        BonificacionesEspeciales:CBOND (NOMBR,PBOND),
        PercepcionesIva:PERCE(PIVAANO)
      `)
      .eq('ruta_visita_id.numero_vend', data.numero)
      .not('RutaDeVisita', 'is', null);

    if (error) throw new Error(error.message);

    const clientesConDeudas: any[] = [];
    console.log(rutaVisita)
    for (const cliente of rutaVisita) {
      const { data: deudas, error: deudasError } = await supabase
        .from('Deudas')
        .select(`*`)
        .eq('cliente', cliente.CODCL);

      if (deudasError) throw new Error(deudasError.message);      

      clientesConDeudas.push({
        ...cliente,
        deudas
      });

      
    }
    // Para buscar de supabase los precios y articulos
      const { data: maxNulisList, error: maxNulisError } = await supabase
      .from('Precios')
      .select('artic_pr, TPLIS, NULIS')
      //.eq('TPLIS', cliente.TPLIS)
      .order('NULIS', { ascending: false });

      if (maxNulisError) throw new Error(maxNulisError.message);

      const latestPricesMap = new Map();

      for (const item of maxNulisList) {
        const key = `${item.artic_pr}-${item.TPLIS}`;
        if (!latestPricesMap.has(key)) {
          latestPricesMap.set(key, item);
        }
      }

      const latestPrices = Array.from(latestPricesMap.values());

      const promises = latestPrices.map(async ({ artic_pr, TPLIS, NULIS }) => {
        const { data, error } = await supabase
          .from('Precios')
          .select(`
            artic_pr,
            TPLIS,
            NULIS,
            prec_bult,
            Articulos(ARTIC, nombre, abrev,Ivas(porc))
          `)
          .eq('artic_pr', artic_pr)
          .eq('TPLIS', TPLIS)
          .eq('NULIS', NULIS)
          .single();

        if (error) console.error(error);
        return data;
      });

      const precios = await Promise.all(promises);
      console.log(precios)

      
      const preciosPorTplis = new Map<number, any[]>();

      for (const precio of precios) {
        if(precio){
          const arr = preciosPorTplis.get(precio.TPLIS) ?? [];
          arr.push(precio);
          preciosPorTplis.set(precio.TPLIS, arr);
        }
      }

    // Guardar en IndexedDB
   
    const db = await setUpDataBase();
    const tx = db.transaction('RutaDeVisita', 'readwrite');

    for (const cliente of clientesConDeudas) {
          await tx.store.put(cliente);
    }

    await tx.done;

    /* const txAux = db.transaction('RutaDeNoVisita','readwrite');
    for (const cliente of clientesConDeudas) {
          await txAux.store.put(cliente);
    } */

    // await txAux.done;
    const txtx = db.transaction('Precios','readwrite');
    const preciosStore = txtx.objectStore('Precios');

    for (const [tplis, lista] of preciosPorTplis.entries()) {
      await preciosStore.put({ TPLIS: tplis, articulos: lista });
    }

    await txtx;


    setFormData({ numero: '', clave: '' });
    sessionStorage.setItem('isLoggedIn', 'true');
    router.push('/menu');
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