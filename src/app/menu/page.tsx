"use client";

import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faRoute, faBan, faSignOutAlt, faFileAlt  } from '@fortawesome/free-solid-svg-icons';

export default function MenuScreen() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white p-14 rounded shadow-md w-1/4"> {/* Aumentado el padding y el ancho */}
          <div className="grid grid-cols-2 gap-6"> {/* Aumentado el espacio entre columnas */}

            {/* Ruta de Visita */}
            <div className="flex flex-col items-center space-y-2 p-6 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300">
              <FontAwesomeIcon icon={faRoute} className="text-green-600 text-7xl" />
              <span className="text-lg font-semibold">Ruta de Visita</span>
            </div>

            {/* Ruta de No Visita */}
            <div className="flex flex-col items-center space-y-2 p-6 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300">
              <FontAwesomeIcon icon={faBan} className="text-red-600 text-7xl" />
              <span className="text-lg font-semibold">Ruta de No Visita</span>
            </div>

            {/* Resumen */}
            <div className="flex flex-col items-center space-y-2 p-6 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300">
              <FontAwesomeIcon icon={faFileAlt} className="text-blue-600 text-7xl" />
              <span className="text-lg font-semibold">Resumen</span>
            </div>

            {/* Salir */}
            <div className="flex flex-col items-center space-y-2 p-6 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300">
              <FontAwesomeIcon icon={faSignOutAlt} className="text-gray-600 text-7xl" />
              <span className="text-lg font-semibold">Salir</span>
            </div>
          </div>
        </div>
      </div>
    );
}
