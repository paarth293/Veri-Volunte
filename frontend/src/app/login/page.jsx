'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '@/context/AuthContext';
import { registerUser } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './page.module.css';

export default function LoginPage() {
  const { user, profile, loading: authLoading, signInWithGoogle, refreshProfile } = useAuth();
  const router = useRouter();

  // Handle auto-routing for halfway-registered users
  useEffect(() => {
    if (!authLoading && user && profile) {
      router.push('/dashboard');
    } else if (!authLoading && user && !profile) {
      setProfileData((prev) => ({ ...prev, name: user.displayName || '' }));
      setShowRoleModal(true);
      setStep(1);
    }
  }, [user, profile, authLoading, router]);

  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [step, setStep] = useState(1);
  const [intendedRole, setIntendedRole] = useState('Volunteer');
  const [profileData, setProfileData] = useState({
    name: '',
    role: 'Volunteer',
    skills: '',
    bio: '',
    location: '',
    availability: '',
    orgName: '',
    registrationNumber: '',
    website: '',
    contactPhone: '',
    focusAreas: ''
  });
  const [registering, setRegistering] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const firebaseUser = await signInWithGoogle();
      // Try to get existing profile
      try {
        const { getMyProfile } = await import('@/lib/api');
        await getMyProfile();
        // Profile exists → go to dashboard
        toast.success('Welcome back!');
        router.push('/dashboard');
      } catch {
        // No profile → show role selection modal
        setProfileData((prev) => ({ ...prev, name: firebaseUser.displayName || '', role: intendedRole }));
        setShowRoleModal(true);
        setStep(1);
      }
    } catch (err) {
      toast.error('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await registerUser(profileData);
      await refreshProfile();
      toast.success(`Welcome to VeriVolunte, ${profileData.name}!`);
      setShowRoleModal(false);
      router.push('/dashboard');
    } catch (err) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.top}>
          <span className={styles.logoMark}>🌿</span>
          <h1 className={styles.title}>Welcome to VeriVolunte</h1>
          <p className={styles.sub}>Sign in to discover events and make an impact</p>
        </div>

        <div className={styles.divider}>
          <span>Select your role to sign in or register</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button
            className={styles.googleBtn}
            style={{ 
              flex: 1, 
              border: intendedRole === 'Volunteer' ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: intendedRole === 'Volunteer' ? 'var(--primary-light)' : 'transparent'
            }}
            onClick={() => setIntendedRole('Volunteer')}
            disabled={loading}
          >
            🙋 Volunteer
          </button>
          <button
            className={styles.googleBtn}
            style={{ 
              flex: 1, 
              border: intendedRole === 'NGO' ? '2px solid var(--secondary)' : '1px solid var(--border)',
              background: intendedRole === 'NGO' ? 'var(--secondary-light)' : 'transparent'
            }}
            onClick={() => setIntendedRole('NGO')}
            disabled={loading}
          >
            🏛️ NGO
          </button>
        </div>

        <button
          className={styles.googleBtn}
          onClick={handleGoogleSignIn}
          disabled={loading}
          id="google-signin-btn"
          style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <FcGoogle size={22} />
          {loading ? 'Signing in...' : `Continue as ${intendedRole} with Google`}
        </button>

        <p className={styles.terms}>
          By signing in, you agree to volunteer thoughtfully and contribute positively to your community.
        </p>
      </motion.div>

      {/* Role Selection Modal */}
      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title="Complete Your Profile">
        <div className={styles.roleModal}>
          {step === 1 && (
            <>
              <p className={styles.roleDesc}>
                Tell us a bit about yourself so we can personalize your experience.
              </p>

              <Input
                label="Your Name"
                id="reg-name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                placeholder="Enter your full name"
              />

              <div className={styles.roleSelect}>
                <p className={styles.roleLabel}>I am joining as:</p>
                <div className={styles.roleOptions}>
                  {['Volunteer', 'NGO'].map((r) => (
                    <button
                      key={r}
                      className={[styles.roleOption, profileData.role === r ? styles.selected : ''].join(' ')}
                      onClick={() => setProfileData((prev) => ({ ...prev, role: r }))}
                      id={`role-option-${r.toLowerCase()}`}
                    >
                      <span className={styles.roleIcon}>{r === 'Volunteer' ? '🙋' : '🏛️'}</span>
                      <span className={styles.roleName}>{r}</span>
                      <span className={styles.roleHint}>
                        {r === 'Volunteer' ? 'Browse & join events' : 'Create & manage events'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => {
                  if (!profileData.name.trim()) {
                    toast.error('Please enter your name.');
                    return;
                  }
                  setStep(2);
                }} 
                fullWidth 
                id="next-step-btn"
              >
                Next
              </Button>
            </>
          )}

          {step === 2 && profileData.role === 'Volunteer' && (
            <div className={styles.stepTwoForm}>
              <p className={styles.roleDesc}>Tell us more about your volunteering preferences.</p>
              <Input label="Skills" name="skills" value={profileData.skills} onChange={handleProfileChange} placeholder="e.g. Teaching, First Aid" />
              <Input label="Location (City)" name="location" value={profileData.location} onChange={handleProfileChange} placeholder="e.g. Mumbai" />
              <Input label="Availability" name="availability" value={profileData.availability} onChange={handleProfileChange} placeholder="e.g. Weekends" />
              <div className={styles.fieldWrapper} style={{ marginBottom: '1rem' }}>
                <label className={styles.label} style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-main)' }}>Bio / About Me</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  placeholder="A short bio"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-main)', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <Button type="button" variant="ghost" onClick={() => setStep(1)} id="back-step-btn">Back</Button>
                <Button onClick={handleRegister} loading={registering} fullWidth id="complete-registration-btn">Complete Registration</Button>
              </div>
            </div>
          )}

          {step === 2 && profileData.role === 'NGO' && (
            <div className={styles.stepTwoForm}>
              <p className={styles.roleDesc}>Please provide your Organization details for verification.</p>
              <Input label="Organization Name" name="orgName" value={profileData.orgName} onChange={handleProfileChange} placeholder="Official Name" />
              <Input label="Registration / ID Number" name="registrationNumber" value={profileData.registrationNumber} onChange={handleProfileChange} placeholder="Govt Reg No." />
              <Input label="Focus Areas" name="focusAreas" value={profileData.focusAreas} onChange={handleProfileChange} placeholder="e.g. Education, Environment" />
              <div style={{ display: 'flex', gap: '1rem' }}>
                 <div style={{ flex: 1 }}><Input label="Contact Phone" name="contactPhone" value={profileData.contactPhone} onChange={handleProfileChange} placeholder="Phone" /></div>
                 <div style={{ flex: 1 }}><Input label="Website" name="website" value={profileData.website} onChange={handleProfileChange} placeholder="URL" /></div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <Button type="button" variant="ghost" onClick={() => setStep(1)} id="back-step-btn">Back</Button>
                <Button onClick={handleRegister} loading={registering} fullWidth id="complete-registration-btn">Complete Registration</Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
