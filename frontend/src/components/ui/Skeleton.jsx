import styles from './Skeleton.module.css';

export function SkeletonLine({ width = '100%', height = '16px', className = '' }) {
  return (
    <div
      className={[styles.skeleton, className].join(' ')}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <SkeletonLine height="180px" className={styles.image} />
      <div className={styles.body}>
        <SkeletonLine width="60%" height="20px" />
        <SkeletonLine width="40%" height="14px" />
        <SkeletonLine height="14px" />
        <SkeletonLine height="14px" />
        <SkeletonLine width="80%" height="14px" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
