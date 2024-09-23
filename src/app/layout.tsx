"use client";
import React, { ReactNode } from 'react';

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
      <body>
        <h1>Granix</h1> {/* Encabezado de la app */}
        {children} {/* Aquí se renderizarán las páginas hijas */}
        <footer>
          <p>Hola</p>
        </footer>
      </body>
    </html>
  );
}

