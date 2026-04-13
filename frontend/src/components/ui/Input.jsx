import styles from './Input.module.css';

export default function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  leftIcon,
  min,
  disabled = false,
}) {
  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {leftIcon && <span className={styles.labelIcon}>{leftIcon}</span>}
          {label}
        </label>
      )}
      <div className={[styles.inputWrap, error ? styles.hasError : ''].join(' ')}>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          disabled={disabled}
          className={styles.input}
          autoComplete="off"
        />
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
