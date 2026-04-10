'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function withAuth(Component, requiredRole = null) {
  return function ProtectedPage(props) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (loading) return;
      if (!user) {
        router.replace('/login');
        return;
      }
      if (requiredRole && profile && profile.role !== requiredRole) {
        router.replace('/dashboard');
      }
    }, [user, profile, loading, router]);

    if (loading) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)'
        }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
        </div>
      );
    }

    if (!user) return null;
    if (requiredRole && profile && profile.role !== requiredRole) return null;

    return <Component {...props} />;
  };
}
