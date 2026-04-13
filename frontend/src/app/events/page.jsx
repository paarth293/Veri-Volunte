'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAllEvents, participateInEvent } from '@/lib/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Link from 'next/link';
import EventRegistrationModal from '@/components/events/EventRegistrationModal';
import styles from './page.module.css';

export default function EventsPage() {
  const { user, profile } = useAuth();
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null); // For modal
  const [search, setSearch]   = useState('');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllEvents();
      setEvents(data);
    } catch {
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleJoin = async (message) => {
    if (!user) { toast.error('Please sign in to join events.'); return; }
    if (!selectedEvent) return;
    
    try {
      await participateInEvent(selectedEvent.id, message);
      toast.success("You've successfully joined this event!");
      fetchEvents();
      // Modal will show success state and handle its own close
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not join this event.');
      throw err; // throw to let modal know it failed
    }
  };

  const openRegistrationModal = (event) => {
    if (!user) {
      toast.error('Please sign in to join events.');
      return;
    }
    setSelectedEvent(event);
  };

  const filtered = events.filter(e =>
    !search.trim() ||
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  );

  const upcoming = filtered.filter(e => new Date(e.date) > new Date());
  const past     = filtered.filter(e => new Date(e.date) <= new Date());

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Volunteering Events</h1>
            <p className={styles.sub}>Discover opportunities to make a real impact in your community.</p>
          </div>
          {profile?.role === 'NGO' && (
            <Link href="/dashboard/create-event" className={styles.createBtn}>+ Post Event</Link>
          )}
        </div>

        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="Search by title or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>}
        </div>

        {loading ? (
          <div className={styles.centerMsg}><div className={styles.spinner} /></div>
        ) : events.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📭</span>
            <p>No events posted yet. Check back soon!</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section>
                <h2 className={styles.sectionTitle}>Upcoming <span className={styles.count}>{upcoming.length}</span></h2>
                <div className={styles.grid}>
                  {upcoming.map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      profile={profile} 
                      onJoin={() => openRegistrationModal(event)} 
                    />
                  ))}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <h2 className={styles.sectionTitle}>Past <span className={styles.count}>{past.length}</span></h2>
                <div className={styles.grid}>
                  {past.map(event => (
                    <EventCard key={event.id} event={event} profile={profile} isPast />
                  ))}
                </div>
              </section>
            )}
            {filtered.length === 0 && search && (
              <p className={styles.noResults}>No events match &quot;{search}&quot;</p>
            )}
          </>
        )}

        {/* Registration Modal */}
        <EventRegistrationModal
          open={!!selectedEvent}
          event={selectedEvent}
          profile={profile}
          onClose={() => setSelectedEvent(null)}
          onConfirm={handleJoin}
        />
      </div>
    </div>
  );
}

function EventCard({ event, profile, onJoin, isPast }) {
  let dateDisplay = '—';
  try { dateDisplay = format(new Date(event.date), 'dd MMM yyyy · hh:mm a'); } catch {}
  const isFull = event.maxParticipants > 0 && event.participants?.length >= event.maxParticipants;
  const isParticipant = profile && event.participants?.includes(profile.uid);
  const canJoin = profile?.role === 'Volunteer' && !isPast && !isFull && !isParticipant;

  return (
    <div className={[styles.card, isPast ? styles.pastCard : ''].join(' ')}>
      <div className={styles.cardTop}>
        <span className={[styles.dot, isPast ? styles.dotPast : styles.dotUpcoming].join(' ')} />
        <span className={styles.dotLabel}>{isPast ? 'Past' : 'Upcoming'}</span>
        {isFull && !isPast && <span className={styles.fullBadge}>Full</span>}
        <span className={styles.volunteerCount}>👥 {event.participants?.length || 0}{event.maxParticipants > 0 ? `/${event.maxParticipants}` : ''}</span>
      </div>
      <h3 className={styles.cardTitle}>{event.title}</h3>
      <p className={styles.cardDesc}>{event.description}</p>
      <div className={styles.cardMeta}>
        <span>📍 {event.location}</span>
        <span>🗓 {dateDisplay}</span>
      </div>
      {!isPast && (
        <div className={styles.cardFooter}>
          {isParticipant ? (
            <span className={styles.joinedBadge}>✓ Joined</span>
          ) : canJoin ? (
            <button className={styles.joinBtn} onClick={onJoin}>
              Join Event
            </button>
          ) : profile?.role === 'NGO' ? (
            <span className={styles.ngoNote}>NGOs cannot join events</span>
          ) : !profile ? (
            <Link href="/login" className={styles.joinBtn}>Sign in to Join</Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
