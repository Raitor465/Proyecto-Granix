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
        <header className="flex justify-between items-center p-4 bg-[#AA2DB3] text-white">
          <h1 className="text-2xl font-bold">Granix</h1>
          <div>
            <img src="/path/to/logo.png" alt="Logo" className="h-10" /> {/* Reemplaza con la ruta de tu logo */}
          </div>
        </header>

        <main className="p-4">
          {children} {/* Aquí se renderizarán las páginas hijas */}
        </main>

        <footer className="bg-gray-800 text-white text-center p-4">
          <p>&copy; {new Date().getFullYear()} Granix. Todos los derechos reservados.</p>
        </footer>
      </body>
    </html>
  );
}
