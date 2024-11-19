"use client"

import React, { Component } from "react";
import OfflineFirstForm from "./logdb/page";
// import { VendedorProvider } from "@/lib/vendedorContext";
export default function Home() {
  return (
    // <VendedorProvider>
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* <p className="text-xl font-semibold text-blue-600">Prueba</p>      */}
      {/* <Component {...pageProps} /> */}
      <OfflineFirstForm/>
    </div>
    // </VendedorProvider>

    
  );
}
