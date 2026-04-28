'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiArrowLeft,
  HiShieldCheck,
  HiBuildingOffice2,
  HiLockClosed,
  HiCheckBadge,
} from 'react-icons/hi2';
import { useAuth } from '@/context/AuthContext';
import { getMyTrustSummary } from '@/lib/api';

// ── Trust Record Card ─────────────────────────────────────────
function TrustRecordCard({ record, index }) {
  const isActive = !record.is_expired;
  const ngoList = record.ngos_who_trusted || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      style={{
        border: `1.5px solid ${isActive ? '#bbf7d0' : '#fecaca'}`,
        borderRadius: '14px',
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
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
              Verified by {record.verified_by_ngo || 'VeriVolunte Platform'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isActive && record.ngo_trust_count > 0 && (
            <span style={{
              padding: '3px 10px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '100px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#1d4ed8',
            }}>
              🤝 {record.ngo_trust_count} NGO{record.ngo_trust_count !== 1 ? 's' : ''} trusted
            </span>
          )}
          <span style={{
            padding: '3px 12px',
            borderRadius: '100px',
            fontSize: '0.75rem',
            fontWeight: 700,
            background: isActive ? '#dcfce7' : '#fee2e2',
            color: isActive ? '#15803d' : '#b91c1c',
            border: `1px solid ${isActive ? '#86efac' : '#fca5a5'}`,
          }}>
            {isActive ? 'Active' : 'Expired'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginBottom: '12px' }}>
          {[
            { label: 'Verified', value: record.verified_at ? new Date(record.verified_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A' },
            { label: 'Expires', value: record.expiry_date || 'No Expiry' },
          ].map(item => (
            <div key={item.label} style={{ background: '#f9fafb', borderRadius: '8px', padding: '8px 12px' }}>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase' }}>{item.label}</p>
              <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: '0.85rem' }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* NGOs who trusted */}
        {ngoList.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <p style={{ margin: '0 0 7px', fontSize: '0.77rem', color: '#6b7280', fontWeight: 600 }}>
              Organizations that trusted this credential:
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

        {ngoList.length === 0 && isActive && (
          <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic' }}>
            No NGO has looked you up yet — once they do, they'll appear here.
          </p>
        )}

        {/* Hash */}
        <div style={{
          padding: '8px 12px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}>
          <p style={{ margin: 0, fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            🔒 Tamper-Proof Hash
          </p>
          <p style={{ margin: '2px 0 0', fontFamily: 'monospace', fontSize: '0.68rem', color: '#555', wordBreak: 'break-all' }}>
            {record.cert_hash}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function MyTrustPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [trustData, setTrustData] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return; }
    fetchTrust();
  }, [user, loading]);

  const fetchTrust = async () => {
    try {
      const data = await getMyTrustSummary();
      setTrustData(data);
    } catch (err) {
      toast.error('Failed to load trust summary');
    } finally {
      setFetching(false);
    }
  };

  if (loading || fetching) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#0D2B5E', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const activeRecords = (trustData?.trust_records || []).filter(r => !r.is_expired);
  const expiredRecords = (trustData?.trust_records || []).filter(r => r.is_expired);
  const totalNgos = trustData?.total_ngos_trusted || 0;
  const isTrusted = activeRecords.length > 0;

  return (
    <div style={{ minHeight: '100vh', padding: '36px 24px 80px', background: 'var(--color-bg)' }}>
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
              background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
            }}>
              🛡️
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, margin: 0 }}>
              My Cross-NGO Trust
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '6px', maxWidth: '580px', lineHeight: 1.6 }}>
            Your verified credentials are shared securely across all NGOs on VeriVolunte.
            Once verified by one, every other NGO can instantly trust you — no re-verification needed.
          </p>
        </motion.div>

        {/* Global trust status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{
            padding: '22px 24px',
            borderRadius: '16px',
            background: isTrusted
              ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
              : 'linear-gradient(135deg, #fffbeb, #fef3c7)',
            border: `2px solid ${isTrusted ? '#86efac' : '#fde68a'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: isTrusted ? '#16a34a' : '#d97706',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isTrusted
                ? <HiCheckBadge size={28} color="white" />
                : <HiShieldCheck size={28} color="white" />}
            </div>
            <div>
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: isTrusted ? '#15803d' : '#92400e' }}>
                {isTrusted ? 'You are Universally Trusted ✅' : 'No Active Trust Yet ⏳'}
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: '0.83rem', color: isTrusted ? '#166534' : '#78350f' }}>
                {isTrusted
                  ? `${activeRecords.length} active credential(s) · Trusted by ${totalNgos} NGO${totalNgos !== 1 ? 's' : ''} · Skip re-verification everywhere`
                  : 'Upload and verify a certificate to build your cross-NGO trust record'}
              </p>
            </div>
          </div>
          {!isTrusted && (
            <button
              onClick={() => router.push('/dashboard/verify-certificate')}
              style={{
                padding: '10px 20px',
                background: '#0D2B5E',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Verify Certificate →
            </button>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}
        >
          {[
            { icon: '✅', value: activeRecords.length, label: 'Active Credentials', bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' },
            { icon: '🤝', value: totalNgos, label: 'NGOs Trusted You', bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' },
            { icon: '❌', value: expiredRecords.length, label: 'Expired', bg: 'linear-gradient(135deg, #fee2e2, #fecaca)' },
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
                width: '42px', height: '42px', borderRadius: '10px',
                background: stat.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
              }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '1.5rem', color: '#111' }}>{stat.value}</p>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#888' }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Active records */}
        {activeRecords.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 style={{ fontWeight: 800, fontSize: '1rem', margin: '0 0 14px' }}>
              ✅ Active Trust Records ({activeRecords.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeRecords.map((record, i) => (
                <TrustRecordCard key={record.id} record={record} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Expired records */}
        {expiredRecords.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 style={{ fontWeight: 800, fontSize: '1rem', margin: '0 0 14px', color: '#9ca3af' }}>
              ❌ Expired Records ({expiredRecords.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {expiredRecords.map((record, i) => (
                <TrustRecordCard key={record.id} record={record} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {(trustData?.trust_records || []).length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              border: '2px dashed #e5e7eb',
              borderRadius: '16px',
              color: '#9ca3af',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🛡️</div>
            <h3 style={{ margin: '0 0 8px', color: '#6b7280' }}>No Trust Records Yet</h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.88rem' }}>
              Upload and verify a certificate to start building your cross-NGO trust profile.
            </p>
            <button
              onClick={() => router.push('/dashboard/verify-certificate')}
              style={{
                padding: '10px 22px', background: '#0D2B5E', color: 'white',
                border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem',
              }}
            >
              Verify a Certificate →
            </button>
          </motion.div>
        )}

        {/* Privacy note */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          style={{
            padding: '14px 18px', borderRadius: '10px',
            background: '#f9fafb', border: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'flex-start', gap: '10px',
          }}
        >
          <HiLockClosed size={18} style={{ color: '#6b7280', marginTop: '2px', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.6 }}>
            <strong style={{ color: '#374151' }}>Privacy-Safe:</strong> Only credential metadata (type, status, expiry, hash) is shared with other NGOs —
            never the full certificate or personal sensitive data.
          </p>
        </motion.div>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
