// src/app/menu/page.tsx
import Link from 'next/link';

export default function MenuPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="grid grid-cols-2 gap-8">
        {/* Botón Ruta de visita */}
        <Link href="/rutavisita">
          <div className="flex flex-col items-center cursor-pointer">
            <img src="/path-to-icons/ruta.png" alt="IMAGEN Ruta de visita" className="h-16 w-16" />
            {/* 

            ACA TIENE QUE IR A RUTA VISITA SI, PERO ES LA PAGINA EN DONDE SE ORGANIZA EL DIA DE VISITA, SU RUTA, EL ORDEN, 
            QUE DESPUES TIENE EL BOTON DESCARGAR RUTA Y RECIEN AHI PASA A LA PAGIAN REAL DE RUTA VISITA.

            */}
            <p>Ruta de visita</p>
          </div>
        </Link>

        {/* Botón Sin ruta de visita */}
        <Link href="/sin-ruta-de-visita">
          <div className="flex flex-col items-center cursor-pointer">
            <img src="/path-to-icons/sin-ruta.png" alt="IMAGEN Sin ruta de visita" className="h-16 w-16" />
            <p>Sin ruta de visita</p>
          </div>
        </Link>

        {/* Botón Resumen */}
        <Link href="/resumen">
          <div className="flex flex-col items-center cursor-pointer">
            <img src="/path-to-icons/resumen.png" alt="IMAGEN Resumen" className="h-16 w-16" />
            <p>Resumen</p>
          </div>
        </Link>

        {/* Botón Salir */}
        <Link href="/login">
          <div className="flex flex-col items-center cursor-pointer">
            <img src="/path-to-icons/salir.png" alt="IMAGEN Salir" className="h-16 w-16" />
            <p>Salir</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

