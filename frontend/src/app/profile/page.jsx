'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiUser, HiEnvelope, HiShieldCheck, HiCalendar } from 'react-icons/hi2';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/formatDate';
import Badge from '@/components/ui/Badge';
import { SkeletonLine } from '@/components/ui/Skeleton';
import styles from './page.module.css';

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.skeleton}>
            <SkeletonLine height="80px" width="80px" />
            <SkeletonLine height="28px" width="40%" />
            <SkeletonLine height="18px" width="60%" />
            <SkeletonLine height="18px" width="50%" />
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile?.name || user.displayName || 'User';
  const initial = displayName[0]?.toUpperCase() || '?';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <motion.div
          className={styles.profileCard}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Gradient strip */}
          <div className={styles.strip} />

          <div className={styles.profileBody}>
            {/* Avatar */}
            <div className={styles.avatarWrap}>
              <div className={styles.avatar}>{initial}</div>
              {profile?.role && (
                <Badge color={profile.role === 'NGO' ? 'secondary' : 'primary'} className={styles.roleBadge}>
                  {profile.role}
                </Badge>
              )}
            </div>

            <div className={styles.info}>
              <h1 className={styles.name}>{displayName}</h1>

              <div className={styles.metaList}>
                <div className={styles.metaItem}>
                  <HiEnvelope size={15} className={styles.metaIcon} />
                  <span>{profile?.email || user.email}</span>
                </div>
                <div className={styles.metaItem}>
                  <HiShieldCheck size={15} className={styles.metaIcon} />
                  <span>{profile?.role || 'Volunteer'}</span>
                </div>
                {profile?.createdAt && (
                  <div className={styles.metaItem}>
                    <HiCalendar size={15} className={styles.metaIcon} />
                    <span>Member since {formatDate(profile.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account details card */}
        <motion.div
          className={styles.detailsCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h2 className={styles.sectionTitle}>Account Details</h2>

          <div className={styles.detailsList}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Full Name</span>
              <span className={styles.detailValue}>{displayName}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Email Address</span>
              <span className={styles.detailValue}>{profile?.email || user.email}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Role</span>
              <span className={styles.detailValue}>
                <Badge color={profile?.role === 'NGO' ? 'secondary' : 'primary'}>
                  {profile?.role || 'Volunteer'}
                </Badge>
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>User ID</span>
              <span className={styles.detailValue} title={user.uid}>
                {user.uid?.slice(0, 16)}...
              </span>
            </div>
            {profile?.createdAt && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Joined</span>
                <span className={styles.detailValue}>{formatDate(profile.createdAt, 'dd MMM yyyy')}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick links */}
        <motion.div
          className={styles.quickLinks}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Link href="/dashboard" className={styles.quickLink} id="profile-to-dashboard">
            <span>📊</span>
            <div>
              <p>Dashboard</p>
              <small>View your {profile?.role === 'NGO' ? 'events' : 'activity'}</small>
            </div>
          </Link>
          <Link href="/events" className={styles.quickLink} id="profile-to-events">
            <span>🔍</span>
            <div>
              <p>Browse Events</p>
              <small>Discover new opportunities</small>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
