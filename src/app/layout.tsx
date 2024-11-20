"use client";
import React, { ReactNode } from 'react';
import "../styles/globals.css";
import Image from "next/image"; // Componente para imágenes en Next.js
import logo from "../lib/granix-logo.jpg"; // Importa el logo correctamente como un módulo estático

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
        <header className="flex justify-between items-center p-4 bg-[#04945C] text-white">
          <h1 className="text-2xl font-bold"></h1>
          <div>
          <Image
              src={logo} // Uso correcto del logo
              alt="Logo de Granix"
              width={40} // Ajusta el ancho según tus necesidades
              height={40} // Ajusta la altura según tus necesidades
              className="h-10 w-auto"
            />          
          </div>
        </header>

        {/* Fondo blanco y texto gris oscuro (#333333) para el contenido principal */}

        <main className="p-4 bg-white text-[#333333]">
          {children} {/* Aquí se renderizarán las páginas hijas */}
        </main>

        {/* Footer con fondo gris oscuro y texto blanco */}
        <footer className="bg-gray-800 text-white text-center p-4">
          <p>&copy; {new Date().getFullYear()} Granix. Todos los derechos reservados.</p>
        </footer>
      </body>
    </html>
  );
}
