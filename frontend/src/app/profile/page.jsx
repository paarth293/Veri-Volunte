'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { HiUser, HiEnvelope, HiShieldCheck, HiCalendar } from 'react-icons/hi2';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/formatDate';
import Badge from '@/components/ui/Badge';
import { SkeletonLine } from '@/components/ui/Skeleton';
import styles from './page.module.css';
import { uploadCertificate, getMyVerifications } from '@/lib/api';

// Add this component inside the file, before the main export
function CertificateSection() {
  const [verifications, setVerifications] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    getMyVerifications()
      .then(d => setVerifications(d.verifications || []))
      .catch(() => {});
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('certificate', file);
      const result = await uploadCertificate(fd);
      toast.success(result.message);
      // Refresh list
      const updated = await getMyVerifications();
      setVerifications(updated.verifications || []);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const STATUS_COLOR = {
    verified:       { bg: '#f0fdf4', text: '#16a34a', label: '✅ Verified' },
    pending_review: { bg: '#fffbeb', text: '#d97706', label: '⏳ Pending Review' },
    expired:        { bg: '#fef2f2', text: '#dc2626', label: '❌ Expired' },
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Certificates</h2>
        <button
          onClick={() => fileRef.current.click()}
          disabled={uploading}
          style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none',
            background: '#0D2B5E', color: 'white', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 600,
          }}
        >
          {uploading ? 'Verifying...' : '+ Upload Certificate'}
        </button>
        <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleUpload} />
      </div>

      {verifications.length === 0 && (
        <p style={{ color: '#888', fontSize: '0.9rem' }}>No certificates uploaded yet.</p>
      )}

      {verifications.map(v => {
        const s = STATUS_COLOR[v.status] || STATUS_COLOR.pending_review;
        return (
          <div key={v.id} style={{
            border: '1px solid #e5e7eb', borderRadius: '12px',
            padding: '1rem', marginBottom: '0.75rem', background: '#fafafa',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{v.certificate_type}</strong>
              <span style={{
                padding: '2px 10px', borderRadius: '20px', fontSize: '0.78rem',
                background: s.bg, color: s.text, fontWeight: 600,
              }}>{s.label}</span>
            </div>
            <p style={{ margin: '4px 0', color: '#555', fontSize: '0.85rem' }}>
              Issued by: {v.issuing_organization}
            </p>
            <p style={{ margin: 0, color: '#888', fontSize: '0.8rem' }}>
              Issued: {v.issue_date || 'N/A'} &nbsp;|&nbsp;
              Expires: {v.expiry_date || 'No expiry'} &nbsp;|&nbsp;
              AI Confidence: {v.confidence}%
            </p>
          </div>
        );
      })}
    </div>
  );
}


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

        {/* Certificates Card (Volunteers Only) */}
        {profile?.role !== 'NGO' && (
          <motion.div
            className={styles.detailsCard}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ marginTop: '1.5rem' }}
          >
            <CertificateSection />
          </motion.div>
        )}
      </div>
    </div>
  );
}
