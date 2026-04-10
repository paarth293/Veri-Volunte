'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiCalendar, HiMapPin, HiMagnifyingGlass } from 'react-icons/hi2';
import { getMyParticipatedEvents } from '@/lib/api';
import { formatDate } from '@/utils/formatDate';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import styles from './VolunteerDashboard.module.css';

export default function VolunteerDashboard({ profile }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyParticipatedEvents()
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.dashboard}>
      {/* Welcome banner */}
      <div className={styles.banner}>
        <div>
          <h2>Welcome, <span>{profile?.name || 'Volunteer'}!</span> 👋</h2>
          <p>Here are the events you&apos;ve signed up for.</p>
        </div>
        <Link href="/events" className={styles.browseBtn} id="volunteer-browse-events-btn">
          <HiMagnifyingGlass size={16} /> Browse Events
        </Link>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span>🗓️</span>
          <div>
            <p className={styles.statValue}>{events.length}</p>
            <p className={styles.statLabel}>Events Joined</p>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>My Events</h3>
        {loading ? (
          <SkeletonGrid count={3} />
        ) : events.length === 0 ? (
          <div className={styles.empty}>
            <span>🌱</span>
            <h4>No events yet</h4>
            <p>Start your volunteering journey by joining an event!</p>
            <Link href="/events" className={styles.emptyLink}>Browse Events →</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                className={styles.card}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <div className={styles.colorBar} />
                <div className={styles.cardBody}>
                  <h4 className={styles.cardTitle}>{event.title}</h4>
                  <div className={styles.cardMeta}>
                    <span><HiCalendar size={13} />{formatDate(event.date)}</span>
                    <span><HiMapPin size={13} />{event.location}</span>
                  </div>
                  <p className={styles.cardDesc}>{event.description}</p>
                  <Link href={`/events/${event.id}`} className={styles.viewLink} id={`vol-event-${event.id}`}>
                    View Details →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
