'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiCalendar, HiMapPin, HiTag, HiUsers, HiDocumentText } from 'react-icons/hi2';
import { createEvent } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './page.module.css';

export default function CreateEventPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    maxParticipants: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!loading) {
      if (!user) { router.replace('/login'); return; }
      if (profile && profile.role !== 'NGO') { router.replace('/dashboard'); }
    }
  }, [user, profile, loading, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.date) errs.date = 'Date is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (form.maxParticipants && isNaN(Number(form.maxParticipants))) {
      errs.maxParticipants = 'Must be a number';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await createEvent({
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        location: form.location.trim(),
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : 0,
      });
      toast.success('Event created successfully! 🎉');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()} id="create-event-back-btn">
            ← Back to Dashboard
          </button>
          <h1 className={styles.title}>Create New Event</h1>
          <p className={styles.sub}>Fill in the details below to post a volunteering opportunity.</p>
        </div>

        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form} id="create-event-form">
            <Input
              label="Event Title *"
              id="event-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Beach Cleanup Drive"
              error={errors.title}
              leftIcon={<HiTag size={16} />}
            />

            <div className={styles.field}>
              <label htmlFor="event-description" className={styles.label}>
                <HiDocumentText size={15} /> Description *
              </label>
              <textarea
                id="event-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the event, what volunteers will do, why it matters..."
                className={[styles.textarea, errors.description ? styles.errorInput : ''].join(' ')}
                rows={5}
              />
              {errors.description && <p className={styles.errorText}>{errors.description}</p>}
            </div>

            <div className={styles.row}>
              <Input
                label="Date & Time *"
                id="event-date"
                name="date"
                type="datetime-local"
                value={form.date}
                onChange={handleChange}
                error={errors.date}
                leftIcon={<HiCalendar size={16} />}
              />
              <Input
                label="Location *"
                id="event-location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Juhu Beach, Mumbai"
                error={errors.location}
                leftIcon={<HiMapPin size={16} />}
              />
            </div>

            <Input
              label="Max Participants (0 = unlimited)"
              id="event-max-participants"
              name="maxParticipants"
              type="number"
              min="0"
              value={form.maxParticipants}
              onChange={handleChange}
              placeholder="Leave blank or 0 for unlimited"
              error={errors.maxParticipants}
              leftIcon={<HiUsers size={16} />}
            />

            <div className={styles.actions}>
              <Button type="button" variant="ghost" onClick={() => router.back()} id="create-event-cancel-btn">
                Cancel
              </Button>
              <Button type="submit" loading={submitting} id="create-event-submit-btn">
                Publish Event
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
