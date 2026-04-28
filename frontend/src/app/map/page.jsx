'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getMapNeeds, getMapVolunteers } from '@/lib/api';

// Dynamically import map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/map/VeriMap'), { ssr: false });

export default function MapPage() {
  const [needs, setNeeds] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [needsData, volsData] = await Promise.all([
          getMapNeeds(),
          getMapVolunteers()
        ]);
        setNeeds(needsData || []);
        setVolunteers(volsData || []);
      } catch (err) {
        console.error('Map data load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading Delhi map...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">VeriVolunte Map - Delhi Region</h1>
      <p className="text-gray-600 mb-6">Events/Needs (Green) • Volunteers (Blue)</p>
      
      <MapComponent 
        needs={needs} 
        volunteers={volunteers} 
        center={[28.6139, 77.2090]}   // Central Delhi (Connaught Place / India Gate area)
        zoom={11}                     // Good zoom level for whole Delhi
      />
    </div>
  );
}