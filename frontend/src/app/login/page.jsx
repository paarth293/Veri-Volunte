'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import styles from './page.module.css';

const ROLES = [
  {
    id: 'Volunteer',
    emoji: '🤝',
    label: 'Volunteer',
    desc: 'Find events & make an impact',
  },
  {
    id: 'NGO',
    emoji: '🏛️',
    label: 'NGO',
    desc: 'Post events & find volunteers',
  },
];

export default function LoginPage() {
  const { user, profile, loading, completeSignIn } = useAuth();
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState('Volunteer');
  const [signingIn, setSigningIn]       = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user && profile) {
      router.replace('/dashboard');
    }
  }, [user, profile, loading, router]);

  const handleGoogleSignIn = async () => {
    if (!selectedRole) {
      toast.error('Please select a role first.');
      return;
    }
    setSigningIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await completeSignIn(result.user, selectedRole);
      toast.success(`Welcome to VeriVolunte!`);
      router.replace('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Sign-in failed. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) return (
    <div className={styles.fullCenter}>
      <div className={styles.spinner} />
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🌿</span>
          <span className={styles.logoText}>VeriVolunte</span>
        </div>

        {/* Headline */}
        <div className={styles.headline}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.sub}>Sign in to discover events and make an impact</p>
        </div>

        {/* Role selector */}
        <div className={styles.roleSection}>
          <p className={styles.roleLabel}>I am joining as a</p>
          <div className={styles.roleGrid}>
            {ROLES.map((role) => (
              <button
                key={role.id}
                className={[styles.roleCard, selectedRole === role.id ? styles.roleCardActive : ''].join(' ')}
                onClick={() => setSelectedRole(role.id)}
                type="button"
              >
                <span className={styles.roleEmoji}>{role.emoji}</span>
                <span className={styles.roleName}>{role.label}</span>
                <span className={styles.roleDesc}>{role.desc}</span>
                {selectedRole === role.id && (
                  <span className={styles.roleCheck}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Google Sign-In */}
        <button
          className={styles.googleBtn}
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          type="button"
        >
          {signingIn ? (
            <span className={styles.btnSpinner} />
          ) : (
            <GoogleIcon />
          )}
          <span>
            {signingIn
              ? 'Signing in…'
              : `Continue as ${selectedRole} with Google`}
          </span>
        </button>

        {/* Footer note */}
        <p className={styles.footerNote}>
          By signing in, you agree to volunteer thoughtfully and contribute
          positively to your community.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
