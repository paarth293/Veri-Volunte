'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMyProfile, registerUser } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const data = await getMyProfile();
          setProfile(data.user);
        } catch {
          // User authenticated but no profile yet (new user) — that's fine
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Called after Google OAuth succeeds for LOGIN.
   * Sends mode='login' — backend returns existing profile or 404.
   */
  const loginUser = async (firebaseUser) => {
    setUser(firebaseUser);
    const data = await registerUser({ mode: 'login' });
    setProfile(data.user);
    return data.user;
  };

  /**
   * Called after Google OAuth succeeds for SIGNUP.
   * Sends role + extra signup fields to backend to create profile.
   */
  const signupUser = async (firebaseUser, role, extraData = {}) => {
    setUser(firebaseUser);
    const payload = { mode: 'signup', role, ...extraData };
    const data = await registerUser(payload);
    setProfile(data.user);
    return data;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const data = await getMyProfile();
      setProfile(data.user);
    } catch {
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginUser, signupUser, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
