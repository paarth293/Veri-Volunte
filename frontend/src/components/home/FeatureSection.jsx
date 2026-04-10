'use client';
import { motion } from 'framer-motion';
import styles from './FeaturesSection.module.css';

const FEATURES = [
  {
    icon: '🔍',
    title: 'Discover Events',
    desc: 'Browse volunteering opportunities posted by verified NGOs across various causes — from education to environment.',
  },
  {
    icon: '✅',
    title: 'One-Click Sign-Up',
    desc: 'Register for events instantly with your Google account. No lengthy forms, no waiting — just pure impact.',
  },
  {
    icon: '🏛️',
    title: 'NGO Dashboard',
    desc: 'NGOs get a dedicated space to create events, track participants, and manage their volunteer workforce effortlessly.',
  },
  {
    icon: '📊',
    title: 'Track Your Journey',
    desc: 'Volunteers can see every event they\'ve signed up for, watching their impact grow over time.',
  },
  {
    icon: '🔐',
    title: 'Role-Based Access',
    desc: 'Secure, token-verified access ensures only authorized NGOs can create events, keeping the platform trustworthy.',
  },
  {
    icon: '🌱',
    title: 'Community First',
    desc: 'Built around the belief that small acts of service, multiplied, create extraordinary social change.',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FeaturesSection() {
  return (
    <section className={styles.section} id="features">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>Why VeriVolunte</span>
          <h2 className={styles.title}>Everything you need to <span className={styles.accent}>volunteer smarter</span></h2>
          <p className={styles.sub}>
            A platform purpose-built for meaningful connections between volunteers and causes that matter.
          </p>
        </div>

        <motion.div
          className={styles.grid}
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {FEATURES.map((f) => (
            <motion.div key={f.title} className={styles.card} variants={item}>
              <span className={styles.icon}>{f.icon}</span>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
