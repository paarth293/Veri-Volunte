'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './CTASection.module.css';

export default function CTASection() {
  return (
    <section className={styles.section} id="cta">
      <div className={styles.container}>
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.bg1} aria-hidden="true" />
          <div className={styles.bg2} aria-hidden="true" />

          <div className={styles.content}>
            <span className={styles.emoji}>🤝</span>
            <h2 className={styles.title}>Ready to make a difference?</h2>
            <p className={styles.sub}>
              Whether you&apos;re an NGO wanting to reach more volunteers, or a volunteer ready to serve —
              VeriVolunte is your platform.
            </p>
            <div className={styles.buttons}>
              <Link href="/events" className={styles.btn} id="cta-browse-btn">Browse Events →</Link>
              <Link href="/login" className={styles.btnOutline} id="cta-register-btn">Register as NGO</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
