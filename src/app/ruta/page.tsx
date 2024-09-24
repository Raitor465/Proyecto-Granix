// pages/rutas.tsx
"use client"
import React from 'react';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

// Define tus ubicaciones de origen y destino
const origin = { lat: -34.397, lng: 150.644 }; // Cambia esto a tu ubicación de origen
const destination = { lat: -34.407, lng: 150.654 }; // Cambia esto a tu ubicación de destino

// Tipo de opciones para DirectionsService
const directionsServiceOptions = {
    destination: destination,
    origin: origin,
    travelMode: 'DRIVING' as google.maps.TravelMode, // Asegúrate de usar el tipo correcto
};

const Rutas = () => {
    const [directions, setDirections] = React.useState<google.maps.DirectionsResult | null>(null);

    const calculateRoute = () => {
        const DirectionsService = new window.google.maps.DirectionsService();
        DirectionsService.route(directionsServiceOptions, (result, status) => {
            if (status === 'OK') {
                setDirections(result);
            } else {
                console.error(`Error: ${result}`);
            }
        });
    };

    React.useEffect(() => {
        calculateRoute();
    }, []);

    return (
        <LoadScript googleMapsApiKey="AIzaSyB8BfqI82l4QuUkkPa6AK9V5L2CYlMMJDo"> {/* Reemplaza TU_API_KEY aquí */}
            <GoogleMap
                mapContainerStyle={{ height: '400px', width: '800px' }}
                center={origin}
                zoom={10}
            >
                {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
        </LoadScript>
    );
};

export default Rutas;
