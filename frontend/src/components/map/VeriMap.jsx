'use client';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

// Fix default markers in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function VeriMap({ needs = [], volunteers = [], center, zoom }) {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '600px', width: '100%', borderRadius: '12px' }}
      className="shadow-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* NGO Events / Needs - Green markers */}
      {needs.map((need) => (
        need.lat && need.lng && (
          <Marker key={`need-${need.id}`} position={[need.lat, need.lng]}>
            <Popup>
              <strong>Need: {need.title}</strong><br />
              Skill: {need.skill_required}<br />
              Urgency: {need.urgency} • {need.people_needed} people<br />
              Location: {need.location}
            </Popup>
          </Marker>
        )
      ))}

      {/* Volunteers - Blue markers */}
      {volunteers.map((vol) => (
        vol.lat && vol.lng && (
          <Marker key={`vol-${vol.id}`} position={[vol.lat, vol.lng]}>
            <Popup>
              <strong>Volunteer: {vol.name}</strong><br />
              Skills: {vol.skills || 'General'}<br />
              Location: {vol.location}
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
}