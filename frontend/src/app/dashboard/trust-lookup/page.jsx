'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiArrowLeft,
  HiMagnifyingGlass,
  HiShieldCheck,
  HiXCircle,
  HiClock,
  HiCheckBadge,
  HiLockClosed,
  HiBuildingOffice2,
  HiUserCircle,
  HiArrowPath,
} from 'react-icons/hi2';
import { useAuth } from '@/context/AuthContext';
import { lookupVolunteerTrust } from '@/lib/api';

// ── How the feature works steps ───────────────────────────────
const HOW_IT_WORKS = [
  { icon: '🔍', title: 'Search', desc: 'Enter the volunteer\'s email address.' },
  { icon: '🔗', title: 'Lookup', desc: 'System checks the shared trust database.' },
  { icon: '✅', title: 'Instant Trust', desc: 'See their verified credentials in one click.' },
  { icon: '⏭️', title: 'Skip Re-Verify', desc: 'Trusted by another NGO? No need to re-verify.' },
];

// ── Trust Badge ───────────────────────────────────────────────
function TrustBadge({ trusted }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 16px',
      borderRadius: '100px',
      fontWeight: 800,
      fontSize: '0.95rem',
      background: trusted ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : 'linear-gradient(135deg, #fee2e2, #fecaca)',
      color: trusted ? '#065f46' : '#991b1b',
      border: `2px solid ${trusted ? '#6ee7b7' : '#fca5a5'}`,
    }}>
      {trusted ? <HiShieldCheck size={18} /> : <HiXCircle size={18} />}
      {trusted ? 'TRUSTED — Skip Re-Verification' : 'NOT TRUSTED — Re-Verify Required'}
    </div>
  );
}

// ── Credential Card ───────────────────────────────────────────
function CredentialCard({ record, index }) {
  const isActive = !record.is_expired;
  const ngoList = record.ngos_who_trusted || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{
        border: `1.5px solid ${isActive ? '#bbf7d0' : '#fecaca'}`,
        borderRadius: '14px',
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 18px',
        background: isActive ? '#f0fdf4' : '#fef2f2',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>{isActive ? '✅' : '❌'}</span>
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#111' }}>
              {record.certificate_type}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#666' }}>
              Issued by {record.issuing_organization}
            </p>
          </div>
        </div>
        <span style={{
          padding: '4px 14px',
          borderRadius: '100px',
          fontSize: '0.75rem',
          fontWeight: 700,
          background: isActive ? '#dcfce7' : '#fee2e2',
          color: isActive ? '#15803d' : '#b91c1c',
          border: `1px solid ${isActive ? '#86efac' : '#fca5a5'}`,
        }}>
          {isActive ? '🟢 Active' : '🔴 Expired'}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginBottom: '14px' }}>
          {[
            { label: 'Verified by NGO', value: record.verified_by_ngo || 'VeriVolunte Platform', icon: '🏢' },
            { label: 'Verified At', value: record.verified_at ? new Date(record.verified_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A', icon: '📅' },
            { label: 'Expiry Date', value: record.expiry_date || 'No Expiry', icon: '⏰' },
            { label: 'NGOs Trusted', value: `${record.ngos_who_trusted?.length || 0} NGO(s)`, icon: '🤝' },
          ].map(item => (
            <div key={item.label} style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px 12px' }}>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {item.icon} {item.label}
              </p>
              <p style={{ margin: '3px 0 0', fontWeight: 700, fontSize: '0.88rem', color: '#111' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* NGOs who trusted this */}
        {ngoList.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>
              🤝 Trusted by these organizations:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {ngoList.map(ngo => (
                <span key={ngo} style={{
                  padding: '3px 10px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '100px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <HiBuildingOffice2 size={11} /> {ngo}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Hash */}
        <div style={{
          padding: '8px 12px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}>
          <p style={{ margin: 0, fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            🔒 SHA-256 Tamper-Proof Hash
          </p>
          <p style={{ margin: '2px 0 0', fontFamily: 'monospace', fontSize: '0.68rem', color: '#555', wordBreak: 'break-all' }}>
            {record.cert_hash}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Volunteer Trust Summary Panel ─────────────────────────────
function VolunteerTrustPanel({ result, onReset }) {
  const { volunteer, trust_summary, trust_records, checked_by_ngo, checked_at } = result;
  const activeRecords = trust_records.filter(r => !r.is_expired);
  const expiredRecords = trust_records.filter(r => r.is_expired);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* Volunteer identity */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '22px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '52px', height: '52px',
            borderRadius: '50%',
            background: trust_summary.trusted
              ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
              : 'linear-gradient(135deg, #fee2e2, #fecaca)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HiUserCircle size={32} color={trust_summary.trusted ? '#059669' : '#dc2626'} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: '#111' }}>
              {volunteer.name}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.83rem', color: '#666' }}>
              {volunteer.email}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <TrustBadge trusted={trust_summary.trusted} />
          <button
            onClick={onReset}
            style={{
              background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px',
              padding: '5px 12px', fontSize: '0.78rem', color: '#888',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
            }}
          >
            <HiArrowPath size={13} /> Search Again
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px',
      }}>
        {[
          {
            icon: '✅',
            value: trust_summary.active_credentials,
            label: 'Active Credentials',
            bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
          },
          {
            icon: '🤝',
            value: trust_summary.total_ngos_trusted,
            label: 'NGOs Trusted',
            bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
          },
          {
            icon: '❌',
            value: trust_summary.expired_credentials,
            label: 'Expired',
            bg: 'linear-gradient(135deg, #fee2e2, #fecaca)',
          },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '42px', height: '42px',
              borderRadius: '10px',
              background: stat.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem',
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1.5rem', color: '#111' }}>{stat.value}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Decision banner */}
      <div style={{
        padding: '16px 20px',
        borderRadius: '14px',
        background: trust_summary.trusted
          ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
          : 'linear-gradient(135deg, #fff7ed, #ffedd5)',
        border: `1.5px solid ${trust_summary.trusted ? '#86efac' : '#fdba74'}`,
      }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: trust_summary.trusted ? '#15803d' : '#c2410c' }}>
          {trust_summary.trusted
            ? `✅ Decision: TRUST INSTANTLY — ${trust_summary.active_credentials} active credential(s) verified by another NGO. No re-verification needed.`
            : '⚠️ Decision: RE-VERIFICATION REQUIRED — This volunteer has no active verified credentials on VeriVolunte.'}
        </p>
        <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#888' }}>
          Checked by <strong>{checked_by_ngo}</strong> · {new Date(checked_at).toLocaleString('en-IN')}
        </p>
      </div>

      {/* Active credentials */}
      {activeRecords.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', margin: '0 0 12px' }}>
            ✅ Active Credentials ({activeRecords.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeRecords.map((record, i) => (
              <CredentialCard key={record.id} record={record} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Expired credentials */}
      {expiredRecords.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', margin: '0 0 12px', color: '#9ca3af' }}>
            ❌ Expired Credentials ({expiredRecords.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {expiredRecords.map((record, i) => (
              <CredentialCard key={record.id} record={record} index={i} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function TrustLookupPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); }
  }, [user, loading]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSearching(true);
    setResult(null);
    setNotFound(false);

    try {
      const data = await lookupVolunteerTrust(email.trim());
      setResult(data);
      if (data.trust_summary.trusted) {
        toast.success('✅ Volunteer is trusted — credentials verified!');
      } else {
        toast('⚠️ No active credentials found', { icon: '⚠️' });
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        setNotFound(true);
        toast.error('Volunteer not found on VeriVolunte');
      } else {
        toast.error(err?.response?.data?.error || 'Lookup failed');
      }
    } finally {
      setSearching(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setNotFound(false);
    setEmail('');
  };

  if (loading) return null;

  return (
    <div style={{
      minHeight: '100vh',
      padding: '36px 24px 80px',
      background: 'var(--color-bg)',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'none', border: '1.5px solid var(--color-border)',
              borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem',
              fontWeight: 600, color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: '16px',
            }}
          >
            <HiArrowLeft size={16} /> Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
            }}>
              🤝
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, margin: 0 }}>
              Cross-NGO Trust Lookup
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '6px', maxWidth: '600px', lineHeight: 1.6 }}>
            Instantly check if a volunteer has been verified by another NGO on VeriVolunte.
            If they have active credentials, you can trust them immediately — no re-verification needed.
          </p>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '20px 24px',
          }}
        >
          <h2 style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 16px' }}>
            How It Works
          </h2>
          <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: 1, minWidth: '120px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{step.icon}</div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.8rem', textAlign: 'center' }}>{step.title}</p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#888', textAlign: 'center', lineHeight: 1.4 }}>{step.desc}</p>
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div style={{ paddingTop: '18px', color: '#d1d5db', fontSize: '1rem', flexShrink: 0, margin: '0 4px' }}>→</div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <h2 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 16px' }}>
            🔍 Look Up a Volunteer
          </h2>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
              <HiMagnifyingGlass
                size={18}
                style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: '#9ca3af',
                }}
              />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="volunteer@email.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={searching || !email.trim()}
              style={{
                padding: '12px 24px',
                background: searching ? '#9ca3af' : '#0D2B5E',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: searching ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              {searching ? (
                <>
                  <span style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Checking...
                </>
              ) : (
                <><HiShieldCheck size={16} /> Check Trust</>
              )}
            </button>
          </form>
        </motion.div>

        {/* Not Found */}
        <AnimatePresence>
          {notFound && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                padding: '24px',
                borderRadius: '14px',
                background: '#fef2f2',
                border: '1.5px solid #fecaca',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
              <h3 style={{ margin: '0 0 6px', color: '#991b1b' }}>Volunteer Not Found</h3>
              <p style={{ margin: '0 0 14px', color: '#666', fontSize: '0.88rem' }}>
                No volunteer with the email <strong>{email}</strong> is registered on VeriVolunte.
              </p>
              <button
                onClick={handleReset}
                style={{
                  padding: '8px 20px', background: '#0D2B5E', color: 'white',
                  border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                }}
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && <VolunteerTrustPanel result={result} onReset={handleReset} />}
        </AnimatePresence>

        {/* Privacy notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: '14px 18px',
            borderRadius: '10px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <HiLockClosed size={18} style={{ color: '#6b7280', marginTop: '2px', flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.82rem', color: '#374151' }}>
              Privacy-Safe Design
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.5 }}>
              We only share credential metadata (type, status, expiry, hash) — never the full certificate or personal sensitive data.
              All lookups are logged for compliance and audit.
            </p>
          </div>
        </motion.div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
