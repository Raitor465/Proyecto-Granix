"use client";
import React, { ReactNode } from 'react';
import "../styles/globals.css";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>Granix</title>
        {/* Puedes agregar otros elementos aquí como meta tags */}
      </head>
      <body className="bg-white text-gray-800">
        {/* Header con color de fondo verde (#008839) y texto en blanco */}
        <header className="flex justify-between items-center p-4 bg-[#04945C] text-white">          <h1 className="text-2xl font-bold">Granix</h1>
          <div>
            <img src="/path/to/logo.png" alt="Logo" className="h-10" /> {/* Reemplaza con la ruta de tu logo */}
          </div>
        </header>

        {/* Fondo blanco y texto gris oscuro (#333333) para el contenido principal */}
        <main className="p-4 bg-white text-[#333333]">          
          {children} {/* Aquí se renderizarán las páginas hijas */}
        </main>

        <footer className="bg-gray-800 text-white text-center p-4">
          <p>&copy; {new Date().getFullYear()} Granix. Todos los derechos reservados.</p>
        </footer>
      </body>
    </html>
  );
}
