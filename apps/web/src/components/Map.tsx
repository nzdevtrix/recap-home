'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';

// Fix default marker icon
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{ position: [number, number]; label: string }>;
}

export default function Map({ center = [51.505, -0.09], zoom = 13, markers = [] }: MapProps) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '400px', width: '100%', borderRadius: '8px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.length === 0 ? (
        <Marker position={center}>
          <Popup>Pickup Location</Popup>
        </Marker>
      ) : (
        markers.map((marker, idx) => (
          <Marker key={idx} position={marker.position}>
            <Popup>{marker.label}</Popup>
          </Marker>
        ))
      )}
    </MapContainer>
  );
}