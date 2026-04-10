'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiCalendar, HiMapPin, HiUsers } from 'react-icons/hi2';
import { formatDate } from '@/utils/formatDate';
import Badge from '@/components/ui/Badge';
import styles from './EventCard.module.css';

export default function EventCard({ event, index = 0 }) {
  const spotsLeft = event.maxParticipants
    ? event.maxParticipants - (event.participants?.length || 0)
    : null;

  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link href={`/events/${event.id}`} className={styles.card} id={`event-card-${event.id}`}>
        {/* Color bar */}
        <div className={styles.colorBar} />

        <div className={styles.body}>
          <div className={styles.topRow}>
            <Badge color={isFull ? 'error' : 'success'}>
              {isFull ? 'Full' : 'Open'}
            </Badge>
            {event.maxParticipants > 0 && (
              <span className={styles.spots}>
                <HiUsers size={13} />
                {isFull ? 'No spots' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
              </span>
            )}
          </div>

          <h3 className={styles.title}>{event.title}</h3>
          <p className={styles.desc}>{event.description}</p>

          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <HiCalendar size={14} />
              {formatDate(event.date)}
            </span>
            <span className={styles.metaItem}>
              <HiMapPin size={14} />
              {event.location}
            </span>
          </div>
        </div>

        <div className={styles.footer}>
          <span className={styles.participants}>
            <HiUsers size={14} />
            {event.participants?.length || 0} volunteer{event.participants?.length !== 1 ? 's' : ''} joined
          </span>
          <span className={styles.viewLink}>View Details →</span>
        </div>
      </Link>
    </motion.div>
  );
}
