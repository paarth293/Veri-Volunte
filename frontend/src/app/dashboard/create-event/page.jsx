'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NGODashboard from '@/components/dashboard/NGODashboard';
import VolunteerDashboard from '@/components/dashboard/VolunteerDashboard';
import styles from './page.module.css';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (!profile) {
        toast.error('Please complete your registration.');
        router.replace('/login');
      }
    }
  }, [user, profile, loading, router]);

  if (loading || !user) {
    return (
      <div className={styles.spinnerPage}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.sub}>
              {profile?.role === 'NGO'
                ? 'Manage your events and reach volunteers.'
                : 'Track your volunteering journey.'}
            </p>
          </div>
        </div>

        {profile?.role === 'NGO' ? (
          <NGODashboard profile={profile} />
        ) : (
          <VolunteerDashboard profile={profile} />
        )}
      </div>
    </div>
  );
}
