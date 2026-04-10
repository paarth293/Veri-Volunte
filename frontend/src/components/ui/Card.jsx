import styles from './Card.module.css';

/**
 * Glass-morphism card wrapper.
 * @param {'default'|'elevated'|'flat'} variant
 */
export default function Card({ children, variant = 'default', className = '', onClick, ...props }) {
  return (
    <div
      className={[styles.card, styles[variant], onClick ? styles.clickable : '', className].join(' ')}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
