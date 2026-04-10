'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiCalendar, HiMapPin, HiUsers, HiPlusCircle } from 'react-icons/hi2';
import { getMyEvents } from '@/lib/api';
import { formatDate } from '@/utils/formatDate';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import styles from './NGODashboard.module.css';

export default function NGODashboard({ profile }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEvents()
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalParticipants = events.reduce((s, e) => s + (e.participants?.length || 0), 0);

  return (
    <div className={styles.dashboard}>
      {/* Welcome banner */}
      <div className={styles.banner}>
        <div>
          <h2>Welcome back, <span>{profile?.name || 'NGO'}!</span></h2>
          <p>Manage your events and connect with volunteers.</p>
        </div>
        <Link href="/dashboard/create-event" className={styles.createBtn} id="ngo-create-event-btn">
          <HiPlusCircle size={18} /> Create New Event
        </Link>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        {[
          { label: 'Total Events', value: events.length, icon: '📋' },
          { label: 'Total Volunteers', value: totalParticipants, icon: '🙋' },
        ].map((s) => (
          <div key={s.label} className={styles.statCard}>
            <span className={styles.statIcon}>{s.icon}</span>
            <div>
              <p className={styles.statValue}>{s.value}</p>
              <p className={styles.statLabel}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Events list */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Your Events</h3>
        {loading ? (
          <SkeletonGrid count={3} />
        ) : events.length === 0 ? (
          <div className={styles.empty}>
            <span>📋</span>
            <p>No events yet. Create your first event!</p>
            <Link href="/dashboard/create-event" className={styles.emptyLink}>Create Event →</Link>
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
                <div className={styles.cardTop}>
                  <h4 className={styles.cardTitle}>{event.title}</h4>
                  <Badge color={event.participants?.length >= event.maxParticipants && event.maxParticipants > 0 ? 'error' : 'success'}>
                    {event.participants?.length >= event.maxParticipants && event.maxParticipants > 0 ? 'Full' : 'Open'}
                  </Badge>
                </div>
                <div className={styles.cardMeta}>
                  <span><HiCalendar size={13} />{formatDate(event.date)}</span>
                  <span><HiMapPin size={13} />{event.location}</span>
                  <span><HiUsers size={13} />{event.participants?.length || 0} joined{event.maxParticipants > 0 ? ` / ${event.maxParticipants}` : ''}</span>
                </div>
                <Link href={`/events/${event.id}`} className={styles.viewLink} id={`ngo-event-${event.id}`}>View Details →</Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
