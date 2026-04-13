'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCalendar, HiMapPin, HiUsers, HiXMark, HiCheckCircle } from 'react-icons/hi2';
import { formatDate } from '@/utils/formatDate';
import styles from './EventRegistrationModal.module.css';

/**
 * EventRegistrationModal
 * Shows event details + volunteer profile info before confirming participation.
 *
 * Props:
 *  - event       : the event object
 *  - profile     : the logged-in volunteer's profile
 *  - onConfirm   : async (message: string) => void — called when user confirms
 *  - onClose     : () => void
 *  - open        : boolean
 */
export default function EventRegistrationModal({ event, profile, onConfirm, onClose, open }) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open || !event) return null;

  const spotsLeft = event.maxParticipants
    ? event.maxParticipants - (event.participants?.length || 0)
    : null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(message.trim());
      setSuccess(true);
    } catch {
      // Error handling is done in the parent
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setMessage('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button className={styles.closeBtn} onClick={handleClose} id="reg-modal-close">
              <HiXMark size={20} />
            </button>

            {success ? (
              /* ── Success State ──────────────────────────────── */
              <div className={styles.successState}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                >
                  <HiCheckCircle className={styles.successIcon} />
                </motion.div>
                <h2 className={styles.successTitle}>You&apos;re In! 🎉</h2>
                <p className={styles.successSub}>
                  You&apos;ve successfully registered for <strong>{event.title}</strong>.
                  Check your dashboard for updates.
                </p>
                <button className={styles.doneBtn} onClick={handleClose} id="reg-modal-done">
                  Done
                </button>
              </div>
            ) : (
              /* ── Registration Form ─────────────────────────── */
              <>
                {/* Header */}
                <div className={styles.header}>
                  <div className={styles.headerIcon}>🤝</div>
                  <h2 className={styles.title}>Confirm Registration</h2>
                  <p className={styles.subtitle}>Review the details before joining this event</p>
                </div>

                {/* Event Summary Card */}
                <div className={styles.eventCard}>
                  <h3 className={styles.eventTitle}>{event.title}</h3>
                  <div className={styles.eventMeta}>
                    <span className={styles.metaItem}>
                      <HiCalendar size={14} />
                      {formatDate(event.date, 'dd MMM yyyy · h:mm a')}
                    </span>
                    <span className={styles.metaItem}>
                      <HiMapPin size={14} />
                      {event.location}
                    </span>
                    <span className={styles.metaItem}>
                      <HiUsers size={14} />
                      {event.participants?.length || 0} volunteer{(event.participants?.length || 0) !== 1 ? 's' : ''} registered
                      {spotsLeft !== null && ` · ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
                    </span>
                  </div>
                  {event.description && (
                    <p className={styles.eventDesc}>{event.description}</p>
                  )}
                </div>

                {/* Volunteer Info */}
                <div className={styles.volunteerCard}>
                  <h4 className={styles.sectionLabel}>Your Profile</h4>
                  <div className={styles.volunteerInfo}>
                    <div className={styles.volunteerAvatar}>
                      {profile?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className={styles.volunteerDetails}>
                      <span className={styles.volunteerName}>{profile?.name || 'Volunteer'}</span>
                      <span className={styles.volunteerEmail}>{profile?.email}</span>
                    </div>
                  </div>
                  {profile?.skills && (
                    <div className={styles.skillsWrap}>
                      <span className={styles.skillsLabel}>Skills:</span>
                      <div className={styles.skillChips}>
                        {profile.skills.split(', ').filter(Boolean).map(skill => (
                          <span key={skill} className={styles.skillChip}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile?.location && (
                    <div className={styles.volunteerLocation}>
                      <HiMapPin size={13} /> {profile.location}
                    </div>
                  )}
                </div>

                {/* Optional message */}
                <div className={styles.messageSection}>
                  <label className={styles.messageLabel} htmlFor="reg-message">
                    Message to Organizer <span className={styles.optional}>(optional)</span>
                  </label>
                  <textarea
                    id="reg-message"
                    className={styles.messageInput}
                    rows={3}
                    placeholder="Introduce yourself, mention any relevant experience, or ask a question..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={500}
                  />
                  <span className={styles.charCount}>{message.length}/500</span>
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={handleClose}
                    disabled={submitting}
                    type="button"
                    id="reg-modal-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.confirmBtn}
                    onClick={handleConfirm}
                    disabled={submitting}
                    type="button"
                    id="reg-modal-confirm"
                  >
                    {submitting ? (
                      <>
                        <span className={styles.btnSpinner} />
                        Registering…
                      </>
                    ) : (
                      'Confirm Registration'
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
