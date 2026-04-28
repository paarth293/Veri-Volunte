'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiCalendar, HiMapPin, HiChevronRight, HiCheckCircle } from 'react-icons/hi2';
import { getMyParticipatedEvents } from '@/lib/api';
import { formatDate } from '@/utils/formatDate';
import Badge from '@/components/ui/Badge';
import styles from './VolunteerDashboard.module.css';

export default function VolunteerDashboard({ profile }) {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyParticipatedEvents();
      setEvents(data);
    } catch (err) {
      setError('Failed to load your events.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const upcoming = events.filter(e => new Date(e.date) > new Date());
  const past     = events.filter(e => new Date(e.date) <= new Date());

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
              Welcome, <span className={styles.welcomeName}>{profile?.name || 'Volunteer'}!</span>
              {profile?.isVerified && (
                <HiCheckCircle 
                  style={{ display: 'inline', color: '#16a34a', marginLeft: '8px', verticalAlign: 'middle', transform: 'translateY(-2px)' }} 
                  size={26}
                  title="Verified Volunteer" 
                />
              )}
            </h2>
            <p className={styles.welcomeSub}>Track your volunteering journey and find new opportunities.</p>
          </div>
          <Link href="/events" className={styles.browseBtn}>
            Browse Events <HiChevronRight size={16} />
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className={styles.statsRow}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>
            <span className={styles.statIcon}>✅</span>
          </div>
          <div>
            <div className={styles.statValue}>{events.length}</div>
            <div className={styles.statLabel}>Total Joined</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
            <span className={styles.statIcon}>📅</span>
          </div>
          <div>
            <div className={styles.statValue}>{upcoming.length}</div>
            <div className={styles.statLabel}>Upcoming</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
            <span className={styles.statIcon}>🏆</span>
          </div>
          <div>
            <div className={styles.statValue}>{past.length}</div>
            <div className={styles.statLabel}>Completed</div>
          </div>
        </div>
      </motion.div>

      {/* Volunteer Profile Info */}
      {profile && (
        <motion.div
          className={styles.profileSummary}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h3 className={styles.sectionTitle}>Your Profile</h3>
          <div className={styles.profileGrid}>
            {profile.location && (
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>📍 Location</span>
                <span className={styles.profileItemValue}>{profile.location}</span>
              </div>
            )}
            {profile.availability && (
              <div className={styles.profileItem}>
                <span className={styles.profileItemLabel}>🕐 Availability</span>
                <span className={styles.profileItemValue}>{profile.availability}</span>
              </div>
            )}
            {profile.skills && (
              <div className={styles.profileItemFull}>
                <span className={styles.profileItemLabel}>🛠 Skills</span>
                <div className={styles.skillChips}>
                  {profile.skills.split(', ').filter(Boolean).map(skill => (
                    <span key={skill} className={styles.skillChip}>{skill}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.bio && (
              <div className={styles.profileItemFull}>
                <span className={styles.profileItemLabel}>📝 Bio</span>
                <span className={styles.profileItemValue}>{profile.bio}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        className={styles.ctaBanner}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div>
          <strong>Ready to make a difference?</strong>
          <p>Browse upcoming volunteering events near you.</p>
        </div>
        <Link href="/events" className={styles.ctaBtn}>Explore Events →</Link>
      </motion.div>

      {/* Verify Certificate CTA + Cross-NGO Trust */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px',
          background: profile?.isVerified ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' : 'linear-gradient(135deg, #f8faff, #eff6ff)',
          border: `1px solid ${profile?.isVerified ? '#bbf7d0' : '#c7d7f9'}`,
          borderRadius: '14px', padding: '18px 22px',
        }}>
          <div>
            <strong style={{ color: profile?.isVerified ? '#16a34a' : '#0D2B5E', fontSize: '0.95rem' }}>
              {profile?.isVerified ? '✅ Your credentials are verified!' : '🛡️ Get your credentials verified'}
            </strong>
            <p style={{ margin: '3px 0 0', fontSize: '0.83rem', color: '#666' }}>
              {profile?.isVerified
                ? `Verified skill: ${profile.verifiedSkill || 'Certificate on file'} — NGOs trust you instantly`
                : 'Upload your certificates. AI verifies them in seconds and gives you a trusted badge across all NGOs.'}
            </p>
          </div>
          <Link href="/dashboard/verify-certificate" style={{
            padding: '9px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem',
            background: profile?.isVerified ? '#16a34a' : '#0D2B5E', color: 'white',
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            {profile?.isVerified ? 'View Certificates →' : 'Verify Now →'}
          </Link>
        </div>

        {/* Cross-NGO Trust card */}
        <Link href="/dashboard/my-trust" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px',
          background: 'linear-gradient(135deg, #faf5ff, #ede9fe)',
          border: '1px solid #ddd6fe',
          borderRadius: '14px', padding: '16px 22px',
          textDecoration: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.6rem' }}>🤝</span>
            <div>
              <strong style={{ color: '#5b21b6', fontSize: '0.92rem', display: 'block' }}>
                Cross-NGO Trust Record
              </strong>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#7c3aed' }}>
                See which NGOs have trusted your credentials — no re-verification needed
              </p>
            </div>
          </div>
          <span style={{
            padding: '7px 16px', borderRadius: '8px',
            background: '#7c3aed', color: 'white',
            fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap',
          }}>
            View Trust →
          </span>
        </Link>
      </motion.div>

      {/* Upcoming events */}
      <EventSection
        title="Upcoming Events"
        events={upcoming}
        loading={loading}
        error={error}
        emptyMsg="You haven't signed up for any upcoming events yet."
        delay={0.25}
      />

      {past.length > 0 && (
        <EventSection
          title="Past Events"
          events={past}
          loading={false}
          error={null}
          emptyMsg=""
          isPast
          delay={0.3}
        />
      )}
    </div>
  );
}

function EventSection({ title, events, loading, error, emptyMsg, isPast, delay = 0 }) {
  return (
    <motion.div
      className={styles.eventsSection}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        {events.length > 0 && (
          <span className={styles.eventCount}>{events.length}</span>
        )}
      </div>

      {loading ? (
        <div className={styles.centerMsg}><div className={styles.spinner} /></div>
      ) : error ? (
        <div className={styles.errorMsg}>{error}</div>
      ) : events.length === 0 ? (
        emptyMsg ? <p className={styles.emptyMsg}>{emptyMsg}</p> : null
      ) : (
        <div className={styles.eventGrid}>
          {events.map((event, i) => (
            <EventCard key={event.id} event={event} isPast={isPast} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function EventCard({ event, isPast, index }) {
  return (
    <motion.div
      className={[styles.eventCard, isPast ? styles.pastCard : ''].join(' ')}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <div className={styles.eventTop}>
        <span className={[styles.statusDot, isPast ? styles.past : styles.upcoming].join(' ')} />
        <span className={styles.statusLabel}>{isPast ? 'Completed' : 'Upcoming'}</span>
        <Badge color={isPast ? 'neutral' : 'success'} className={styles.mlAuto}>
          {isPast ? 'Done' : 'Active'}
        </Badge>
      </div>
      <h4 className={styles.eventTitle}>{event.title}</h4>
      {event.description && (
        <p className={styles.eventDesc}>{event.description}</p>
      )}
      <div className={styles.eventMeta}>
        <span><HiMapPin size={13} /> {event.location}</span>
        <span><HiCalendar size={13} /> {formatDate(event.date, 'dd MMM yyyy · h:mm a')}</span>
      </div>
      <Link href={`/events/${event.id}`} className={styles.viewLink}>
        View Details <HiChevronRight size={14} />
      </Link>
    </motion.div>
  );
}
