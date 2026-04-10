'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './HeroSection.module.css';

const STATS = [
  { value: '500+', label: 'Volunteers' },
  { value: '80+',  label: 'NGOs' },
  { value: '1.2K', label: 'Events' },
];

export default function HeroSection() {
  return (
    <section className={styles.hero} id="hero">
      {/* Background blobs */}
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />

      <div className={styles.content}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className={styles.textBlock}
        >
          <span className={styles.pill}>🌿 Volunteering Made Simple</span>
          <h1 className={styles.heading}>
            Find Your Purpose,<br />
            <span className={styles.accent}>Serve Your Community</span>
          </h1>
          <p className={styles.sub}>
            VeriVolunte bridges the gap between passionate volunteers and NGOs that need help.
            Discover meaningful events near you, sign up in seconds, and make a lasting impact.
          </p>
          <div className={styles.cta}>
            <Link href="/events" className={styles.primaryBtn} id="hero-browse-btn">
              Explore Events
            </Link>
            <Link href="/login" className={styles.secondaryBtn} id="hero-join-btn">
              Join as NGO
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className={styles.stats}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {STATS.map((s) => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
