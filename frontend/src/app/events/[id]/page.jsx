'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiCalendar, HiMapPin, HiUsers, HiArrowLeft } from 'react-icons/hi2';
import { getEventById, participateInEvent } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { SkeletonLine } from '@/components/ui/Skeleton';
import EventRegistrationModal from '@/components/events/EventRegistrationModal';
import styles from './page.module.css';

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getEventById(id)
      .then(setEvent)
      .catch(() => toast.error('Event not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const isAlreadyJoined = event?.participants?.includes(user?.uid);
  const isFull = event?.maxParticipants > 0 && event?.participants?.length >= event?.maxParticipants;
  const isNGO = profile?.role === 'NGO';

  const handleParticipate = async (message) => {
    if (!user) { router.push('/login'); return; }
    try {
      await participateInEvent(id, message);
      // Wait a moment for modal success animation before updating local state
      setTimeout(async () => {
        const updated = await getEventById(id);
        setEvent(updated);
      }, 2000);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not join this event.');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.skeleton}>
            <SkeletonLine height="40px" width="60%" />
            <SkeletonLine height="20px" width="40%" />
            <SkeletonLine height="120px" />
            <SkeletonLine height="20px" width="50%" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <span>🔍</span>
          <h2>Event not found</h2>
          <Button onClick={() => router.push('/events')} variant="ghost">Browse All Events</Button>
        </div>
      </div>
    );
  }

  const spotsLeft = event.maxParticipants
    ? event.maxParticipants - (event.participants?.length || 0)
    : null;

  return (
    <div className={styles.page}>
      {/* Back button */}
      <div className={styles.topBar}>
        <div className={styles.container}>
          <button className={styles.backBtn} onClick={() => router.back()} id="event-back-btn">
            <HiArrowLeft size={16} /> Back to Events
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.container}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.badges}>
              <Badge color={isFull ? 'error' : 'success'}>{isFull ? 'Full' : 'Open'}</Badge>
              {event.maxParticipants > 0 && (
                <Badge color="neutral">{spotsLeft <= 0 ? 'No spots' : `${spotsLeft} spots left`}</Badge>
              )}
            </div>
            <h1 className={styles.title}>{event.title}</h1>

            <div className={styles.meta}>
              <span className={styles.metaItem}><HiCalendar size={16} />{formatDateTime(event.date)}</span>
              <span className={styles.metaItem}><HiMapPin size={16} />{event.location}</span>
              <span className={styles.metaItem}>
                <HiUsers size={16} />
                {event.participants?.length || 0} volunteer{event.participants?.length !== 1 ? 's' : ''} registered
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Description */}
            <motion.div
              className={styles.description}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2>About this Event</h2>
              <p>{event.description}</p>
            </motion.div>

            {/* Action Card */}
            <motion.div
              className={styles.actionCard}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className={styles.infoList}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Date</span>
                  <span className={styles.infoValue}>{formatDate(event.date)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Location</span>
                  <span className={styles.infoValue}>{event.location}</span>
                </div>
                {event.maxParticipants > 0 && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Capacity</span>
                    <span className={styles.infoValue}>
                      {event.participants?.length || 0} / {event.maxParticipants}
                    </span>
                  </div>
                )}
              </div>

              {!user ? (
                <Button onClick={() => router.push('/login')} fullWidth id="event-login-to-join-btn">
                  Sign In to Join
                </Button>
              ) : isNGO ? (
                <div className={styles.ngoNote}>
                  <span>🏛️</span>
                  <p>NGOs cannot register as participants.</p>
                </div>
              ) : isAlreadyJoined ? (
                <div className={styles.joinedBadge}>
                  <span>✅</span>
                  <p>You&apos;re registered for this event!</p>
                </div>
              ) : isFull ? (
                <Button disabled fullWidth variant="ghost">Event is Full</Button>
              ) : (
                <Button
                  onClick={() => setShowModal(true)}
                  fullWidth
                  id="event-participate-btn"
                >
                  Join as Volunteer
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      
      {event && (
        <EventRegistrationModal
          open={showModal}
          event={event}
          profile={profile}
          onClose={() => setShowModal(false)}
          onConfirm={handleParticipate}
        />
      )}
    </div>
  );
}
