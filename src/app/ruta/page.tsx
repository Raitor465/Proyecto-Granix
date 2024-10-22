// pages/rutas.tsx
"use client"
import React from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer } from '@react-google-maps/api';

const origin = { lat: -34.397, lng: 150.644 };
const destination = { lat: -34.407, lng: 150.654 };

const Rutas = () => {
    const [directions, setDirections] = React.useState<google.maps.DirectionsResult | null>(null);

    const calculateRoute = () => {
        const DirectionsService = new window.google.maps.DirectionsService();
        DirectionsService.route(
            {
                origin,
                destination,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                } else {
                    console.error(`Error: ${status}`);
                }
            }
        );
    };

    return (
        <LoadScript
            googleMapsApiKey="AIzaSyB8BfqI82l4QuUkkPa6AK9V5L2CYlMMJDo"
            onLoad={calculateRoute} // Llama a la función cuando el script esté cargado
        >
            <GoogleMap mapContainerStyle={{ height: '400px', width: '800px' }} center={origin} zoom={10}>
                {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
        </LoadScript>
    );
};

export default Rutas;