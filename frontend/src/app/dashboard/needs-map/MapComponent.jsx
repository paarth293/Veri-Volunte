'use client';
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const makeNeedIcon = (urgency) => {
  const color = urgency === 'high' ? '#dc2626' : urgency === 'low' ? '#16a34a' : '#d97706';
  const label = urgency === 'high' ? '!' : urgency === 'medium' ? '~' : '·';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 26 16 26S32 26 32 16C32 7.163 24.837 0 16 0z" fill="${color}" opacity="0.9"/>
    <circle cx="16" cy="16" r="8" fill="white" opacity="0.95"/>
    <text x="16" y="20" text-anchor="middle" font-size="11" font-weight="bold" fill="${color}">${label}</text>
  </svg>`;
  return new L.DivIcon({ html: svg, className: '', iconSize: [32, 42], iconAnchor: [16, 42], popupAnchor: [0, -44] });
};

const makeVolunteerIcon = (isVerified) => {
  const color = isVerified ? '#0D2B5E' : '#9ca3af';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="8" fill="${color}" stroke="white" stroke-width="2"/>
    <text x="10" y="14" text-anchor="middle" font-size="9" fill="white">${isVerified ? '✓' : '○'}</text>
  </svg>`;
  return new L.DivIcon({ html: svg, className: '', iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -12] });
};

function HeatmapLayer({ volunteers }) {
  const map = useMap();
  const heatRef = useRef(null);

  useEffect(() => {
    if (!map || volunteers.length === 0) return;
    const load = async () => {
      if (!window.L.heatLayer) {
        await new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js';
          s.onload = res; s.onerror = rej;
          document.head.appendChild(s);
        });
      }
      if (heatRef.current) map.removeLayer(heatRef.current);
      const points = volunteers.map(v => [v.lat, v.lng, 0.8]);
      heatRef.current = window.L.heatLayer(points, {
        radius: 40, blur: 28, maxZoom: 14,
        gradient: { 0.2: '#bfdbfe', 0.5: '#3b82f6', 0.8: '#1d4ed8', 1.0: '#0D2B5E' },
      }).addTo(map);
    };
    load().catch(console.error);
    return () => { if (heatRef.current) map.removeLayer(heatRef.current); };
  }, [map, volunteers]);

  return null;
}

export default function DynamicMap({ needs, volunteers = [], showVolunteers, showHeatmap, activeNeed, onNeedClick }) {
  const defaultCenter = [28.6139, 77.2090];
  const center = needs.length > 0 && needs[0].lat ? [needs[0].lat, needs[0].lng] : defaultCenter;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showHeatmap && volunteers.length > 0 && <HeatmapLayer volunteers={volunteers} />}

        {showVolunteers && volunteers.map(v => (
          <Marker key={v.id} position={[v.lat, v.lng]} icon={makeVolunteerIcon(v.isVerified)}>
            <Popup>
              <div style={{ minWidth: '160px', padding: '4px' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '13px' }}>{v.name}</p>
                <p style={{ margin: '0 0 3px', fontSize: '12px', color: '#555' }}>📍 {v.location || 'Nearby'}</p>
                <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#555' }}>
                  🛠 {Array.isArray(v.skills) ? v.skills.join(', ') : v.skills || 'General'}
                </p>
                <span style={{
                  padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                  background: v.isVerified ? '#f0fdf4' : '#f9fafb',
                  color: v.isVerified ? '#16a34a' : '#6b7280',
                }}>{v.isVerified ? '✅ Verified' : '○ Unverified'}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {needs.map(need => (
          <Marker
            key={need.id}
            position={[need.lat, need.lng]}
            icon={makeNeedIcon(need.urgency)}
            eventHandlers={{ click: () => onNeedClick && onNeedClick(need) }}
          >
            <Popup>
              <div style={{ minWidth: '200px', padding: '4px' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 800 }}>{need.title}</h3>
                {need.location && <p style={{ margin: '0 0 3px', fontSize: '12px' }}>📍 <strong>{need.location}</strong></p>}
                <p style={{ margin: '0 0 3px', fontSize: '12px' }}>🛠 Skill: <strong>{need.skill}</strong></p>
                <p style={{ margin: '0 0 6px', fontSize: '12px' }}>👥 <strong>{need.people_required} people needed</strong></p>
                {need.confidence && (
                  <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#888' }}>AI Confidence: {need.confidence}%</p>
                )}
                <span style={{
                  padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                  fontWeight: 700, textTransform: 'uppercase', color: 'white',
                  background: need.urgency === 'high' ? '#dc2626' : need.urgency === 'low' ? '#16a34a' : '#d97706',
                }}>{need.urgency} urgency</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {activeNeed && (
          <Circle
            center={[activeNeed.lat, activeNeed.lng]}
            radius={5000}
            pathOptions={{ color: '#0D2B5E', fillColor: '#3b82f6', fillOpacity: 0.07, weight: 1.5, dashArray: '6 4' }}
          />
        )}
      </MapContainer>
    </div>
  );
}
