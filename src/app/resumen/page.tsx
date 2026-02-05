"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { setUpDataBase } from '@/lib/indexedDB';
import Image from 'next/image';

interface ItemPedido {
  articulo: {
    artic_pr: string;
    Articulos?: {
      ARTIC: string;
      DESCRIP: string;
    };
    prec_bult: number;
  };
  cantidad: number;
  subtotal: number;
  bonificacionItem: number;
  IVA: number;
}

interface Pedido {
  id?: number;
  cliente_id: number;
  cliente_nombre?: string;
  items: ItemPedido[];
  total: number;
  fecha?: string;
  sincronizado?: boolean;
}

type TipoVista = 'menu' | 'incorporados' | 'sin-incorporar';

export default function Resumen() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(false);
  const [vista, setVista] = useState<TipoVista>('menu');

  const cargarPedidosIncorporados = async () => {
    setCargando(true);
    try {
      // Cargar pedidos sincronizados desde Supabase
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) {
        console.error("Error al cargar pedidos desde Supabase:", error);
        setPedidos([]);
        setCargando(false);
        return;
      }

      const pedidosSincronizados = (data || []).map(p => ({ ...p, sincronizado: true }));
      setPedidos(pedidosSincronizados);
      setCargando(false);
    } catch (error) {
      console.error("Error al cargar pedidos incorporados:", error);
      setPedidos([]);
      setCargando(false);
    }
  };

  const cargarPedidosSinIncorporar = async () => {
    setCargando(true);
    try {
      const db = await setUpDataBase();
      
      // Los pedidos pendientes están en CarritoCambiosPrecios
      const cambiosPendientes = await db.getAll('CarritoCambiosPrecios');
      
      // Filtrar solo los items de tipo 'pedido'
      const pedidosNoSincronizados = cambiosPendientes
        .filter(item => item.tipo === 'pedido')
        .map(p => ({ 
          ...p, 
          sincronizado: false 
        }));
      
      setPedidos(pedidosNoSincronizados);
      setCargando(false);
    } catch (error) {
      console.error("Error al cargar pedidos sin incorporar:", error);
      setPedidos([]);
      setCargando(false);
    }
  };

  const calcularTotalGeneral = () => {
    return pedidos.reduce((acc, pedido) => acc + (pedido.total || 0), 0);
  };

  const calcularTotalesPorColumna = () => {
    let totalBultos = 0;
    let totalKilos = 0;
    let totalImporte = 0;

    if (pedidos && pedidos.length > 0) {
      pedidos.forEach((pedido) => {
        if (pedido.items && pedido.items.length > 0) {
          pedido.items.forEach((item) => {
            totalBultos += item.cantidad;
            // Asumiendo que kilos = cantidad (ajusta según tu lógica)
            totalKilos += item.cantidad;
            totalImporte += item.subtotal;
          });
        }
      });
    }

    return { totalBultos, totalKilos, totalImporte, totalBonif: 0 };
  };

  const totalesGenerales = calcularTotalesPorColumna();

  const handleVolverMenu = () => {
    if (vista === 'menu') {
      router.push('/menu');
    } else {
      setVista('menu');
      setPedidos([]);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Cargando resumen...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="p-4 bg-white shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleVolverMenu}
            className="bg-gray-100 text-gray-700 p-2 rounded-md hover:bg-gray-200 transition duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Resumen</h1>
        </div>
        
      </header>

      {/* Main content */}
      <main className="flex-grow p-4 overflow-auto">
        {vista === 'menu' ? (
          /* Menú de opciones */
          <div className="flex flex-col gap-4 max-w-md mx-auto mt-8">
            <button
              onClick={() => {
                setVista('sin-incorporar');
                cargarPedidosSinIncorporar();
              }}
              className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-200 text-lg font-semibold"
            >
              Buscar pedidos sin incorporar
            </button>
            <button
              onClick={() => {
                setVista('incorporados');
                cargarPedidosIncorporados();
              }}
              className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 transition duration-200 text-lg font-semibold"
            >
              Buscar pedidos incorporados
            </button>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">
              {vista === 'sin-incorporar' 
                ? 'No hay pedidos sin incorporar' 
                : 'No hay pedidos incorporados'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Tabla de resumen */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="p-3 text-left border border-gray-700">Datos</th>
                    <th className="p-3 text-center border border-gray-700">Bultos</th>
                    <th className="p-3 text-center border border-gray-700">Kilos</th>
                    <th className="p-3 text-right border border-gray-700">Imp. Total</th>
                    <th className="p-3 text-right border border-gray-700">Bonif.</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido, pedidoIndex) => (
                    <React.Fragment key={pedidoIndex}>
                      {/* Encabezado del cliente */}
                      <tr className="bg-gray-100 font-semibold">
                        <td colSpan={5} className="p-2 border border-gray-300">
                          Cliente: {pedido.cliente_nombre || `Cliente ${pedido.cliente_id}`} (ID: {pedido.cliente_id})
                        </td>
                      </tr>
                      
                      {/* Items del pedido */}
                      {pedido.items && pedido.items.length > 0 ? (
                        pedido.items.map((item, itemIndex) => (
                          <tr key={itemIndex} className="hover:bg-gray-50">
                            <td className="p-2 border border-gray-300">
                              <div className="text-sm">
                                <div className="font-medium">
                                  {item.articulo?.Articulos?.ARTIC || item.articulo?.artic_pr || 'N/A'}
                                </div>
                                <div className="text-gray-600 text-xs">
                                  {item.articulo?.Articulos?.DESCRIP || 'Sin descripción'}
                                </div>
                              </div>
                            </td>
                            <td className="p-2 text-center border border-gray-300">
                              {item.cantidad || 0}
                            </td>
                            <td className="p-2 text-center border border-gray-300">
                              {item.cantidad || 0}
                            </td>
                            <td className="p-2 text-right border border-gray-300">
                              ${(item.subtotal || 0).toFixed(2)}
                            </td>
                            <td className="p-2 text-right border border-gray-300">
                              {item.bonificacionItem > 0 ? `${item.bonificacionItem}%` : '0'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-2 border border-gray-300 text-center text-gray-500">
                            Sin items en este pedido
                          </td>
                        </tr>
                      )}

                      {/* Total del cliente */}
                      <tr className="bg-yellow-200 font-bold">
                        <td className="p-2 border border-gray-300">TOTAL CLIENTE</td>
                        <td className="p-2 text-center border border-gray-300">
                          {pedido.items && pedido.items.length > 0 
                            ? pedido.items.reduce((acc, item) => acc + (item.cantidad || 0), 0)
                            : 0}
                        </td>
                        <td className="p-2 text-center border border-gray-300">
                          {pedido.items && pedido.items.length > 0 
                            ? pedido.items.reduce((acc, item) => acc + (item.cantidad || 0), 0)
                            : 0}
                        </td>
                        <td className="p-2 text-right border border-gray-300">
                          ${(pedido.total || 0).toFixed(2)}
                        </td>
                        <td className="p-2 text-right border border-gray-300">
                          $0.00
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}

                  {/* Total general */}
                  <tr className="bg-pink-300 font-bold text-lg">
                    <td className="p-3 border border-gray-400">TOTAL GENERAL</td>
                    <td className="p-3 text-center border border-gray-400">
                      {totalesGenerales.totalBultos}
                    </td>
                    <td className="p-3 text-center border border-gray-400">
                      {totalesGenerales.totalKilos}
                    </td>
                    <td className="p-3 text-right border border-gray-400">
                      ${totalesGenerales.totalImporte.toFixed(2)}
                    </td>
                    <td className="p-3 text-right border border-gray-400">
                      $0.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Información del tipo de vista */}
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <p className="text-sm font-medium text-blue-800">
                {vista === 'sin-incorporar' 
                  ? '📋 Pedidos sin incorporar (pendientes de sincronización)' 
                  : '✅ Pedidos incorporados (sincronizados con el sistema)'}
              </p>
            </div>

            {/* Botón Volver */}
            <div className="p-4 bg-gray-50 flex justify-center">
              <button
                onClick={handleVolverMenu}
                className="bg-gray-800 text-white px-8 py-3 rounded-md hover:bg-gray-700 transition duration-200 font-medium"
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
