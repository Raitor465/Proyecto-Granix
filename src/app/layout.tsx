"use client"
import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en"> {/* Asegúrate de incluir la etiqueta <html> */}
      <head>
        <title>Granix</title> {/* Puedes agregar otros elementos aquí como meta tags */}
      </head>
      <body>
        <h1>Granix</h1> {/* Encabezado de la app */}
        {children} {/* Aquí se renderizarán las páginas hijas */}
      </body>
      <footer>
        <p>Hola</p>
      </footer>
    </html>
  );
}
