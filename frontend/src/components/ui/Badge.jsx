import styles from './Badge.module.css';

/**
 * Status badge / pill.
 * @param {'primary'|'secondary'|'success'|'warning'|'error'|'neutral'} color
 */
export default function Badge({ children, color = 'primary', className = '' }) {
  return (
    <span className={[styles.badge, styles[color], className].join(' ')}>
      {children}
    </span>
  );
}
