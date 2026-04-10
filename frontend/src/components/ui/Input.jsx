import styles from './Input.module.css';

export default function Input({
  label,
  id,
  error,
  helperText,
  leftIcon,
  type = 'text',
  className = '',
  ...props
}) {
  return (
    <div className={styles.wrapper}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <div className={styles.inputWrapper}>
        {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
        <input
          id={id}
          type={type}
          className={[
            styles.input,
            error ? styles.error : '',
            leftIcon ? styles.withIcon : '',
            className
          ].join(' ')}
          {...props}
        />
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
      {helperText && !error && <p className={styles.helperText}>{helperText}</p>}
    </div>
  );
}
