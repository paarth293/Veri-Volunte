'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import styles from './page.module.css';

/* ── Role options ─────────────────────────────────────────── */
const ROLES = [
  { id: 'Volunteer', emoji: '🤝', label: 'Volunteer', desc: 'Find events & make an impact' },
  { id: 'NGO',       emoji: '🏛️', label: 'NGO',       desc: 'Post events & find volunteers' },
];

/* ── Skill options for volunteers ─────────────────────────── */
const SKILL_OPTIONS = [
  'First Aid / CPR', 'Medical Support', 'Teaching / Tutoring', 'Construction',
  'IT / Tech Support', 'Logistics / Driving', 'Counselling', 'Cooking / Food Aid',
  'Rescue Operations', 'Communication / PR', 'Legal Aid', 'Photography / Media',
  'Environmental Work', 'Animal Care', 'Fundraising', 'Translation',
];

/* ── Focus areas for NGOs ─────────────────────────────────── */
const FOCUS_OPTIONS = [
  'Disaster Relief', 'Education', 'Healthcare', 'Environment', 'Women Empowerment',
  'Child Welfare', 'Elderly Care', 'Animal Welfare', 'Poverty Alleviation',
  'Water & Sanitation', 'Mental Health', 'Community Development',
];

export default function LoginPage() {
  const { user, profile, loading, loginUser, signupUser } = useAuth();
  const router = useRouter();

  const [mode, setMode]               = useState('login');   // 'login' | 'signup'
  const [selectedRole, setSelectedRole] = useState('Volunteer');
  const [busy, setBusy]               = useState(false);

  /* ── Signup-only extra fields ──────────────────────────── */
  const [form, setForm] = useState({
    name:               '',
    // Volunteer fields
    skills:             [],
    bio:                '',
    location:           '',
    availability:       '',
    // NGO fields
    orgName:            '',
    registrationNumber: '',
    website:            '',
    contactPhone:       '',
    focusAreas:         [],
    orgDescription:     '',
    foundedYear:        '',
    address:            '',
  });

  /* ── Redirect if already signed in ────────────────────── */
  useEffect(() => {
    if (!loading && user && profile) router.replace('/dashboard');
  }, [user, profile, loading, router]);

  const updateField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const toggleMulti = (key, value) => {
    setForm(prev => {
      const current = prev[key];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value],
      };
    });
  };

  /* ── Validation ─────────────────────────────────────────── */
  const validate = () => {
    if (mode === 'signup') {
      if (!form.name.trim()) { toast.error('Please enter your name.'); return false; }
      if (selectedRole === 'Volunteer') {
        if (!form.location.trim())   { toast.error('Please enter your location.'); return false; }
        if (!form.availability.trim()) { toast.error('Please enter your availability.'); return false; }
      }
      if (selectedRole === 'NGO') {
        if (!form.orgName.trim())    { toast.error('Please enter your organization name.'); return false; }
        if (!form.contactPhone.trim()) { toast.error('Please enter a contact phone number.'); return false; }
      }
    }
    return true;
  };

  /* ── Google sign-in handler ─────────────────────────────── */
  const handleGoogleAuth = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);

      if (mode === 'login') {
        // LOGIN: just authenticate and load existing profile
        try {
          await loginUser(result.user);
          toast.success('Welcome back! 👋');
          router.replace('/dashboard');
        } catch (err) {
          // If user doesn't exist, prompt them to sign up
          if (err?.response?.status === 404) {
            toast.error('No account found. Please sign up first.');
            setMode('signup');
            // Sign out since they don't have a profile yet
            await auth.signOut();
          } else {
            throw err;
          }
        }
      } else {
        // SIGNUP: create new user with role + extra data
        const extraData = selectedRole === 'Volunteer'
          ? {
              name:         form.name,
              skills:       form.skills.join(', '),
              bio:          form.bio,
              location:     form.location,
              availability: form.availability,
            }
          : {
              name:               form.name,
              orgName:            form.orgName,
              registrationNumber: form.registrationNumber,
              website:            form.website,
              contactPhone:       form.contactPhone,
              focusAreas:         form.focusAreas.join(', '),
              orgDescription:     form.orgDescription,
              foundedYear:        form.foundedYear,
              address:            form.address,
            };

        const data = await signupUser(result.user, selectedRole, extraData);

        if (data.alreadyExists) {
          toast.success(`You already have an account as ${data.user.role}. Logged you in! 👋`);
        } else {
          toast.success('Account created! Welcome 🎉');
        }
        router.replace('/dashboard');
      }
    } catch (err) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(mode === 'signup' ? 'Sign-up failed. Please try again.' : 'Login failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading) return (
    <div className={styles.fullCenter}><div className={styles.spinner} /></div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🌿</span>
          <span className={styles.logoText}>VeriVolunte</span>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={[styles.tab, mode === 'login'  ? styles.tabActive : ''].join(' ')}
            onClick={() => setMode('login')}
            type="button"
          >Login</button>
          <button
            className={[styles.tab, mode === 'signup' ? styles.tabActive : ''].join(' ')}
            onClick={() => setMode('signup')}
            type="button"
          >Sign Up</button>
        </div>

        {/* Headline */}
        <div className={styles.headline}>
          <h1 className={styles.title}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className={styles.sub}>
            {mode === 'login'
              ? 'Sign in to access your dashboard'
              : 'Join VeriVolunte — help reaches the right people'}
          </p>
        </div>

        {/* Role selector — only show on signup */}
        {mode === 'signup' && (
          <div className={styles.roleSection}>
            <p className={styles.roleLabel}>I am a</p>
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
                  {selectedRole === role.id && <span className={styles.roleCheck}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Signup-only detailed form ─────────────────────── */}
        {mode === 'signup' && (
          <div className={styles.signupForm}>

            {/* Common: Name */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                {selectedRole === 'NGO' ? 'Your Name (Contact Person)' : 'Full Name'} *
              </label>
              <input
                className={styles.textInput}
                type="text"
                placeholder={selectedRole === 'NGO' ? 'e.g. Priya Sharma' : 'e.g. Rahul Verma'}
                value={form.name}
                onChange={e => updateField('name', e.target.value)}
              />
            </div>

            {/* ── VOLUNTEER fields ───────────────────────────── */}
            {selectedRole === 'Volunteer' && (
              <>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Location *</label>
                  <input
                    className={styles.textInput}
                    type="text"
                    placeholder="e.g. Sector 5, Delhi"
                    value={form.location}
                    onChange={e => updateField('location', e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Availability *</label>
                  <select
                    className={styles.selectInput}
                    value={form.availability}
                    onChange={e => updateField('availability', e.target.value)}
                  >
                    <option value="">Select your availability…</option>
                    <option value="Weekdays only">Weekdays only</option>
                    <option value="Weekends only">Weekends only</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Flexible / On-call">Flexible / On-call</option>
                    <option value="Emergency only">Emergency only</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Skills (select all that apply)</label>
                  <div className={styles.chipGrid}>
                    {SKILL_OPTIONS.map(skill => (
                      <button
                        key={skill}
                        type="button"
                        className={[styles.chip, form.skills.includes(skill) ? styles.chipActive : ''].join(' ')}
                        onClick={() => toggleMulti('skills', skill)}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Short Bio</label>
                  <textarea
                    className={styles.textArea}
                    rows={3}
                    placeholder="Tell NGOs a little about yourself and why you volunteer…"
                    value={form.bio}
                    onChange={e => updateField('bio', e.target.value)}
                  />
                </div>
              </>
            )}

            {/* ── NGO fields ──────────────────────────────────── */}
            {selectedRole === 'NGO' && (
              <>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Organization Name *</label>
                  <input
                    className={styles.textInput}
                    type="text"
                    placeholder="e.g. HelpIndia Foundation"
                    value={form.orgName}
                    onChange={e => updateField('orgName', e.target.value)}
                  />
                </div>

                <div className={styles.twoCol}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Registration Number</label>
                    <input
                      className={styles.textInput}
                      type="text"
                      placeholder="e.g. NGO/2021/123"
                      value={form.registrationNumber}
                      onChange={e => updateField('registrationNumber', e.target.value)}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Founded Year</label>
                    <input
                      className={styles.textInput}
                      type="number"
                      placeholder="e.g. 2010"
                      min="1900"
                      max="2026"
                      value={form.foundedYear}
                      onChange={e => updateField('foundedYear', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.twoCol}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Contact Phone *</label>
                    <input
                      className={styles.textInput}
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={form.contactPhone}
                      onChange={e => updateField('contactPhone', e.target.value)}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Website</label>
                    <input
                      className={styles.textInput}
                      type="url"
                      placeholder="https://your-ngo.org"
                      value={form.website}
                      onChange={e => updateField('website', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Address / Location</label>
                  <input
                    className={styles.textInput}
                    type="text"
                    placeholder="e.g. Connaught Place, New Delhi"
                    value={form.address}
                    onChange={e => updateField('address', e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Focus Areas (select all that apply)</label>
                  <div className={styles.chipGrid}>
                    {FOCUS_OPTIONS.map(area => (
                      <button
                        key={area}
                        type="button"
                        className={[styles.chip, form.focusAreas.includes(area) ? styles.chipActive : ''].join(' ')}
                        onClick={() => toggleMulti('focusAreas', area)}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Organization Description</label>
                  <textarea
                    className={styles.textArea}
                    rows={3}
                    placeholder="Briefly describe your NGO's mission and the work you do…"
                    value={form.orgDescription}
                    onChange={e => updateField('orgDescription', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Divider */}
        <div className={styles.divider} />

        {/* Google Button */}
        <button
          className={styles.googleBtn}
          onClick={handleGoogleAuth}
          disabled={busy}
          type="button"
        >
          {busy ? <span className={styles.btnSpinner} /> : <GoogleIcon />}
          <span>
            {busy
              ? (mode === 'signup' ? 'Creating account…' : 'Signing in…')
              : (mode === 'signup'
                  ? `Sign up as ${selectedRole} with Google`
                  : 'Continue with Google')}
          </span>
        </button>

        {/* Switch mode link */}
        <p className={styles.switchMode}>
          {mode === 'login'
            ? <>Don&apos;t have an account?{' '}
                <button type="button" className={styles.switchLink} onClick={() => setMode('signup')}>
                  Sign up
                </button>
              </>
            : <>Already have an account?{' '}
                <button type="button" className={styles.switchLink} onClick={() => setMode('login')}>
                  Log in
                </button>
              </>}
        </p>

        <p className={styles.footerNote}>
          By continuing, you agree to volunteer thoughtfully and contribute
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
