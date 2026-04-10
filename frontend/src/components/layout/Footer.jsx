import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer} id="main-footer">
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>🌿 Veri<span>Volunte</span></span>
          <p>Connecting compassionate volunteers with NGOs that need them most.</p>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <h4>Platform</h4>
            <Link href="/events">Browse Events</Link>
            <Link href="/login">Sign In</Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>
          <div className={styles.col}>
            <h4>Roles</h4>
            <p>Volunteers</p>
            <p>NGOs</p>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} VeriVolunte. Built with purpose.</p>
      </div>
    </footer>
  );
}
