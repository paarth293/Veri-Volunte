'use client';
import { HiSun, HiMoon } from 'react-icons/hi2';
import { useTheme } from '@/context/ThemeContext';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className={styles.toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      id="theme-toggle-btn"
    >
      <span className={[styles.track, isDark ? styles.dark : ''].join(' ')}>
        <span className={styles.thumb}>
          {isDark ? <HiMoon size={14} /> : <HiSun size={14} />}
        </span>
      </span>
    </button>
  );
}
