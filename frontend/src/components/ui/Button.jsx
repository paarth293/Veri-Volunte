import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  id,
  className = '',
}) {
  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[styles.btn, styles[variant], loading ? styles.loading : '', className].join(' ')}
    >
      {loading && <span className={styles.spinner} />}
      <span className={styles.label}>{children}</span>
    </button>
  );
}
