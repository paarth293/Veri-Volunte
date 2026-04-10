'use client';
import { useState, useEffect } from 'react';
import { getAllEvents } from '@/lib/api';
import EventCard from '@/components/events/EventCard';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import styles from './page.module.css';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getAllEvents()
      .then(setEvents)
      .catch(() => setError('Failed to load events. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter(
    (e) =>
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.location?.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>Discover Volunteer Events</h1>
          <p className={styles.sub}>Find opportunities to contribute, connect, and create change.</p>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search by title, location, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
              id="events-search-input"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.container}>
          {loading ? (
            <SkeletonGrid count={6} />
          ) : error ? (
            <div className={styles.errorState}>
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <span>🔍</span>
              <h3>{search ? 'No events match your search' : 'No events yet'}</h3>
              <p>{search ? 'Try different keywords.' : 'Check back soon — NGOs are adding events!'}</p>
            </div>
          ) : (
            <>
              <p className={styles.count}>{filtered.length} event{filtered.length !== 1 ? 's' : ''} found</p>
              <div className={styles.grid}>
                {filtered.map((event, i) => (
                  <EventCard key={event.id} event={event} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
