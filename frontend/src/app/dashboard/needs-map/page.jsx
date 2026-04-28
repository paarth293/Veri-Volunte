'use client';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiArrowLeft } from 'react-icons/hi2';
import { useAuth } from '@/context/AuthContext';
import { getMapNeeds, getMapVolunteers, deleteNeed } from '@/lib/api';
import styles from './page.module.css';

const Map = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Loading Map...</div>,
});

export default function NeedsMapPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [needs, setNeeds] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showVolunteers, setShowVolunteers] = useState(false);
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [activeNeed, setActiveNeed] = useState(null);

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return; }
    fetchAll();
  }, [user, loading]);

  const fetchAll = async () => {
    try {
      const [needsData, volData] = await Promise.allSettled([getMapNeeds(), getMapVolunteers()]);
      if (needsData.status === 'fulfilled') setNeeds(needsData.value || []);
      if (volData.status === 'fulfilled') setVolunteers(volData.value || []);
    } catch {
      toast.error('Failed to load map data');
    } finally {
      setFetching(false);
    }
  };

  const filteredNeeds = useMemo(() => {
    if (filterUrgency === 'all') return needs;
    return needs.filter(n => n.urgency === filterUrgency);
  }, [needs, filterUrgency]);

  // Count volunteers near active need (within ~5km using rough degree math)
  const nearbyVolunteers = useMemo(() => {
    if (!activeNeed) return [];
    return volunteers.filter(v => {
      const dlat = v.lat - activeNeed.lat;
      const dlng = v.lng - activeNeed.lng;
      const dist = Math.sqrt(dlat * dlat + dlng * dlng) * 111; // approx km
      return dist <= 5;
    });
  }, [activeNeed, volunteers]);

  if (loading) return null;

  const highCount = needs.filter(n => n.urgency === 'high').length;
  const medCount  = needs.filter(n => n.urgency === 'medium').length;
  const verifiedVols = volunteers.filter(v => v.isVerified).length;

  return (
    <div className={styles.page}>
      <div className={styles.blob} aria-hidden="true" />
      <div className={styles.container}>

        {/* Header */}
        <motion.div className={styles.header} initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <button className={styles.backBtn} onClick={() => router.push('/dashboard')}>
            <HiArrowLeft size={16} /> Back to Dashboard
          </button>
          <div>
            <h1 className={styles.title}>Live Needs Map</h1>
            <p className={styles.sub}>Real-time heatmap of volunteer density and colour-coded need pins. Click a pin to see how many volunteers are nearby.</p>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Needs', value: needs.length, color: '#0D2B5E' },
            { label: 'High Urgency', value: highCount, color: '#dc2626' },
            { label: 'Medium Urgency', value: medCount, color: '#d97706' },
            { label: 'Active Volunteers', value: volunteers.length, color: '#2563eb' },
            { label: 'Verified', value: verifiedVols, color: '#16a34a' },
          ].map(s => (
            <div key={s.label} style={{
              flex: '1 1 120px', background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: '10px', padding: '12px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Controls + Map */}
        <motion.div className={styles.mapSection} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

          {/* Controls Row */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Legend */}
            <div className={styles.legend} style={{ flex: 1, minWidth: '280px' }}>
              <span><div className={styles.dot} style={{ background: '#dc2626' }} /> High</span>
              <span><div className={styles.dot} style={{ background: '#d97706' }} /> Medium</span>
              <span><div className={styles.dot} style={{ background: '#16a34a' }} /> Low</span>
              <span><div className={styles.dot} style={{ background: '#3b82f6', borderRadius: '2px' }} /> Volunteer density</span>
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => setShowHeatmap(h => !h)} style={{
                padding: '6px 14px', borderRadius: '8px', border: '1.5px solid',
                borderColor: showHeatmap ? '#2563eb' : 'var(--color-border)',
                background: showHeatmap ? '#eff6ff' : 'transparent',
                color: showHeatmap ? '#1d4ed8' : 'var(--color-text-muted)',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              }}>
                🌡 Heatmap {showHeatmap ? 'ON' : 'OFF'}
              </button>

              <button onClick={() => setShowVolunteers(v => !v)} style={{
                padding: '6px 14px', borderRadius: '8px', border: '1.5px solid',
                borderColor: showVolunteers ? '#0D2B5E' : 'var(--color-border)',
                background: showVolunteers ? '#f0f4ff' : 'transparent',
                color: showVolunteers ? '#0D2B5E' : 'var(--color-text-muted)',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              }}>
                👤 Volunteers {showVolunteers ? 'ON' : 'OFF'}
              </button>

              {['all', 'high', 'medium', 'low'].map(u => (
                <button key={u} onClick={() => setFilterUrgency(u)} style={{
                  padding: '6px 14px', borderRadius: '8px', border: '1.5px solid',
                  borderColor: filterUrgency === u ? '#d97706' : 'var(--color-border)',
                  background: filterUrgency === u ? '#fffbeb' : 'transparent',
                  color: filterUrgency === u ? '#b45309' : 'var(--color-text-muted)',
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize',
                }}>{u === 'all' ? 'All Needs' : u}</button>
              ))}
            </div>
          </div>

          {/* Active Need Info Panel */}
          {activeNeed && (
            <div style={{
              background: '#f0f4ff', border: '1px solid #c7d7f9', borderRadius: '10px',
              padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: '8px',
            }}>
              <div>
                <strong style={{ color: '#0D2B5E', fontSize: '0.9rem' }}>📍 {activeNeed.title}</strong>
                <span style={{ marginLeft: '12px', fontSize: '0.82rem', color: '#555' }}>
                  {activeNeed.location} · Skill: {activeNeed.skill}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{
                  background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px',
                  borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                }}>
                  {nearbyVolunteers.length} volunteers within 5km
                  {nearbyVolunteers.filter(v => v.isVerified).length > 0 &&
                    ` · ${nearbyVolunteers.filter(v => v.isVerified).length} verified`}
                </span>
                <button 
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to delete this need?")) {
                      try {
                        await deleteNeed(activeNeed.id);
                        setNeeds(prev => prev.filter(n => n.id !== activeNeed.id));
                        setActiveNeed(null);
                        toast.success("Need deleted successfully");
                      } catch (e) {
                         toast.error("Failed to delete need");
                      }
                    }
                  }} 
                  style={{
                    background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 10px',
                    borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    marginLeft: '8px'
                  }}
                >
                  Delete Need
                </button>
                <button onClick={() => setActiveNeed(null)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '1rem',
                }}>✕</button>
              </div>
            </div>
          )}

          {/* Map */}
          <div className={styles.mapContainer}>
            {!fetching && (
              <Map
                needs={filteredNeeds}
                volunteers={volunteers}
                showVolunteers={showVolunteers}
                showHeatmap={showHeatmap}
                activeNeed={activeNeed}
                onNeedClick={setActiveNeed}
              />
            )}
            {fetching && <div className={styles.mapLoading}>Loading map data...</div>}
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            Click any need pin to see nearby volunteer density within a 5km radius. Toggle heatmap to visualise volunteer concentration.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
