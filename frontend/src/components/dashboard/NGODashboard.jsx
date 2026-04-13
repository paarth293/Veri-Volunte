'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiCalendar, HiMapPin, HiUsers, HiPlusCircle, HiChevronRight } from 'react-icons/hi2';
import { getMyEvents } from '@/lib/api';
import { formatDate } from '@/utils/formatDate';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import styles from './NGODashboard.module.css';

export default function NGODashboard({ profile }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyEvents()
      .then(data => setEvents(data))
      .catch(() => setError('Failed to load your events.'))
      .finally(() => setLoading(false));
  }, []);

  const totalParticipants = events.reduce((s, e) => s + (e.participants?.length || 0), 0);
  const upcoming = events.filter(e => new Date(e.date) > new Date());
  const past = events.filter(e => new Date(e.date) <= new Date());

  return (
    <div className={styles.root}>
      {/* Welcome banner */}
      <motion.div
        className={styles.welcomeBanner}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.welcomeContent}>
          <div className={styles.welcomeText}>
            <h2 className={styles.welcomeTitle}>
              Welcome back, <span className={styles.welcomeName}>{profile?.orgName || profile?.name || 'NGO'}!</span>
            </h2>
            <p className={styles.welcomeSub}>Manage your events and connect with verified volunteers.</p>
          </div>
          <Link href="/dashboard/create-event" className={styles.createBtn} id="ngo-create-event-btn">
            <HiPlusCircle size={18} />
            <span>Create Event</span>
          </Link>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        className={styles.statsRow}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
            <span className={styles.statIcon}>📋</span>
          </div>
          <div>
            <p className={styles.statValue}>{events.length}</p>
            <p className={styles.statLabel}>Total Events</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>
            <span className={styles.statIcon}>📅</span>
          </div>
          <div>
            <p className={styles.statValue}>{upcoming.length}</p>
            <p className={styles.statLabel}>Upcoming</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
            <span className={styles.statIcon}>🙋</span>
          </div>
          <div>
            <p className={styles.statValue}>{totalParticipants}</p>
            <p className={styles.statLabel}>Total Volunteers</p>
          </div>
        </div>
      </motion.div>

      {/* NGO profile summary */}
      {profile && (
        <motion.div
          className={styles.profileSummary}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h3 className={styles.sectionTitle}>Organization Info</h3>
          <div className={styles.profileGrid}>
            {profile.orgName && (
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>Organization</span>
                <span className={styles.profileItemValue}>{profile.orgName}</span>
              </div>
            )}
            {profile.focusAreas && (
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>Focus Areas</span>
                <span className={styles.profileItemValue}>{profile.focusAreas}</span>
              </div>
            )}
            {profile.contactPhone && (
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>Contact</span>
                <span className={styles.profileItemValue}>{profile.contactPhone}</span>
              </div>
            )}
            {profile.address && (
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>Address</span>
                <span className={styles.profileItemValue}>{profile.address}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Events list */}
      <motion.div
        className={styles.eventsSection}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Your Events</h3>
          {events.length > 0 && (
            <span className={styles.eventCount}>{events.length} total</span>
          )}
        </div>

        {loading ? (
          <SkeletonGrid count={3} />
        ) : error ? (
          <div className={styles.errorMsg}>{error}</div>
        ) : events.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📋</span>
            <h4>No events yet</h4>
            <p>Create your first event and start connecting with volunteers!</p>
            <Link href="/dashboard/create-event" className={styles.emptyBtn}>
              <HiPlusCircle size={16} /> Create Your First Event
            </Link>
          </div>
        ) : (
          <div className={styles.eventGrid}>
            {events.map((event, i) => {
              const isPast = new Date(event.date) <= new Date();
              const isFull = event.maxParticipants > 0 && event.participants?.length >= event.maxParticipants;

              return (
                <motion.div
                  key={event.id}
                  className={[styles.eventCard, isPast ? styles.pastCard : ''].join(' ')}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className={styles.eventTop}>
                    <span className={[styles.statusDot, isPast ? styles.past : styles.upcoming].join(' ')} />
                    <span className={styles.statusLabel}>{isPast ? 'Completed' : 'Active'}</span>
                    <div className={styles.eventBadges}>
                      <Badge color={isFull ? 'error' : 'success'}>
                        {isFull ? 'Full' : 'Open'}
                      </Badge>
                    </div>
                  </div>

                  <h4 className={styles.eventTitle}>{event.title}</h4>

                  {event.description && (
                    <p className={styles.eventDesc}>{event.description}</p>
                  )}

                  <div className={styles.eventMeta}>
                    <span><HiCalendar size={13} /> {formatDate(event.date, 'dd MMM yyyy · h:mm a')}</span>
                    <span><HiMapPin size={13} /> {event.location}</span>
                    <span>
                      <HiUsers size={13} /> {event.participants?.length || 0} joined
                      {event.maxParticipants > 0 ? ` / ${event.maxParticipants}` : ''}
                    </span>
                  </div>

                  <Link href={`/events/${event.id}`} className={styles.viewLink} id={`ngo-event-${event.id}`}>
                    View Details <HiChevronRight size={14} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
