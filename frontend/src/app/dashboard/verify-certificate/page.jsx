'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiShieldCheck, HiClock, HiXCircle, HiArrowUpTray, HiDocumentText } from 'react-icons/hi2';
import { useAuth } from '@/context/AuthContext';
import { uploadCertificate, getMyVerifications } from '@/lib/api';

// ── Status config ─────────────────────────────────────────────────
const STATUS = {
  verified:       { label: 'Verified',       icon: '✅', bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  pending_review: { label: 'Pending Review', icon: '⏳', bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  expired:        { label: 'Expired',        icon: '❌', bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
};

// ── Upload Zone ────────────────────────────────────────────────────
function UploadZone({ onUpload, uploading }) {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    if (file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
    onUpload(file);
  };

  return (
    <div
      onClick={() => !uploading && fileRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
      style={{
        border: `2px dashed ${dragOver ? '#2563eb' : '#d1d5db'}`,
        borderRadius: '16px',
        padding: '40px 24px',
        textAlign: 'center',
        cursor: uploading ? 'not-allowed' : 'pointer',
        background: dragOver ? '#eff6ff' : '#fafafa',
        transition: 'all 0.2s',
        position: 'relative',
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.pdf"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {uploading ? (
        <div>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
          <p style={{ fontWeight: 700, color: '#0D2B5E', marginBottom: '6px' }}>AI is analysing your certificate…</p>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>Extracting name, type, issuer, expiry date</p>
          <div style={{
            marginTop: '16px', height: '4px', borderRadius: '4px',
            background: '#e5e7eb', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: '60%', background: '#2563eb',
              borderRadius: '4px', animation: 'pulse 1.5s infinite',
            }} />
          </div>
        </div>
      ) : preview ? (
        <div>
          <img src={preview} alt="Certificate preview" style={{ maxHeight: '140px', maxWidth: '100%', borderRadius: '8px', marginBottom: '12px', objectFit: 'contain' }} />
          <p style={{ color: '#888', fontSize: '0.82rem' }}>Click or drag to upload a different certificate</p>
        </div>
      ) : (
        <div>
          <HiArrowUpTray size={36} style={{ color: '#9ca3af', marginBottom: '12px' }} />
          <p style={{ fontWeight: 700, fontSize: '1rem', color: '#374151', marginBottom: '6px' }}>
            Drop your certificate here
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>or click to browse · JPG, PNG, PDF up to 10MB</p>
        </div>
      )}
    </div>
  );
}

// ── Certificate Card ───────────────────────────────────────────────
function CertCard({ v }) {
  const s = STATUS[v.status] || STATUS.pending_review;
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        border: `1px solid ${s.border}`, borderRadius: '14px',
        overflow: 'hidden', background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* Card Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px', cursor: 'pointer',
          background: s.bg,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#111' }}>
              {v.certificate_type}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#666' }}>
              {v.issuing_organization}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            padding: '3px 12px', borderRadius: '20px', fontSize: '0.75rem',
            fontWeight: 700, background: s.bg, color: s.text, border: `1px solid ${s.border}`,
          }}>{s.label}</span>
          <span style={{ color: '#aaa', fontSize: '0.85rem' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
          >
            <div style={{ padding: '16px 18px', borderTop: `1px solid ${s.border}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {[
                  { label: 'Holder Name', value: v.holder_name },
                  { label: 'Certificate Type', value: v.certificate_type },
                  { label: 'Issuing Organization', value: v.issuing_organization },
                  { label: 'Issue Date', value: v.issue_date || 'N/A' },
                  { label: 'Expiry Date', value: v.expiry_date || 'No expiry' },
                  { label: 'Certificate ID', value: v.certificate_id || 'N/A' },
                  { label: 'AI Confidence', value: `${v.confidence}%` },
                  { label: 'Verified By', value: v.verified_by || 'Pending' },
                ].map(item => (
                  <div key={item.label} style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px 12px' }}>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {item.label}
                    </p>
                    <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.88rem', color: '#111' }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Confidence Bar */}
              <div style={{ marginTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#888' }}>AI Confidence Score</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: v.confidence >= 75 ? '#16a34a' : '#d97706' }}>
                    {v.confidence}%
                  </span>
                </div>
                <div style={{ height: '6px', borderRadius: '4px', background: '#e5e7eb', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${v.confidence}%`,
                    background: v.confidence >= 75 ? '#16a34a' : v.confidence >= 50 ? '#d97706' : '#dc2626',
                    borderRadius: '4px', transition: 'width 0.8s ease',
                  }} />
                </div>
                <p style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '4px' }}>
                  {v.confidence >= 75
                    ? '✅ High confidence — auto-approved'
                    : v.confidence >= 50
                    ? '⏳ Medium confidence — sent for human review'
                    : '⚠️ Low confidence — manual verification required'}
                </p>
              </div>

              {/* Hash */}
              {v.cert_hash && (
                <div style={{ marginTop: '12px', padding: '8px 12px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase' }}>
                    🔒 Tamper-proof hash (cross-NGO trust)
                  </p>
                  <p style={{ margin: '2px 0 0', fontFamily: 'monospace', fontSize: '0.72rem', color: '#555', wordBreak: 'break-all' }}>
                    {v.cert_hash}
                  </p>
                </div>
              )}

              <p style={{ margin: '10px 0 0', fontSize: '0.75rem', color: '#aaa' }}>
                Submitted: {v.created_at ? new Date(v.created_at).toLocaleString() : 'N/A'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── How It Works Steps ─────────────────────────────────────────────
const STEPS = [
  { icon: '📤', title: 'Upload', desc: 'Upload a JPG, PNG or PDF of your certificate.' },
  { icon: '🔍', title: 'AI Extraction', desc: 'Gemini reads the certificate and extracts name, type, issuer and expiry.' },
  { icon: '🛡️', title: 'Confidence Check', desc: 'If AI confidence ≥ 75% and certificate is not expired → auto-approved instantly.' },
  { icon: '👤', title: 'Human Review', desc: 'Lower confidence cases go to an admin dashboard for manual sign-off.' },
  { icon: '🔒', title: 'Trust Hash', desc: 'A SHA-256 hash is stored so other NGOs can trust your credential without re-verification.' },
];

// ── Main Page ──────────────────────────────────────────────────────
export default function VerifyCertificatePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [verifications, setVerifications] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return; }
    fetchVerifications();
  }, [user, loading]);

  const fetchVerifications = async () => {
    try {
      const d = await getMyVerifications();
      setVerifications(d.verifications || []);
    } catch { /* silent */ } finally {
      setLoadingList(false);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('certificate', file);
      const res = await uploadCertificate(fd);
      setResult(res);
      if (res.status === 'verified') toast.success('🎉 Certificate auto-verified!');
      else if (res.status === 'expired') toast.error('Certificate is expired');
      else toast('Certificate sent for human review', { icon: '⏳' });
      await fetchVerifications();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return null;

  return (
    <div style={{ minHeight: '100vh', padding: '36px 24px 80px', background: 'var(--color-bg)', position: 'relative' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>

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
          ><HiArrowLeft size={16} /> Back to Dashboard</button>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, margin: 0 }}>
            Certificate Verification
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '6px', maxWidth: '560px', lineHeight: 1.6 }}>
            Upload your certificates (First Aid, CPR, medical, etc.) and AI will extract and verify them instantly. Verified credentials are trusted across all NGOs on VeriVolunte.
          </p>
        </motion.div>

        {/* How It Works */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px 24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 16px' }}>
            How Verification Works
          </h2>
          <div style={{ display: 'flex', gap: '0', overflowX: 'auto', paddingBottom: '4px' }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0', minWidth: '140px', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{step.icon}</div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.8rem', textAlign: 'center' }}>{step.title}</p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#888', textAlign: 'center', lineHeight: 1.4 }}>{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ paddingTop: '18px', color: '#d1d5db', fontSize: '1rem', flexShrink: 0, margin: '0 4px' }}>→</div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upload Zone */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 16px' }}>Upload a Certificate</h2>
          <UploadZone onUpload={handleUpload} uploading={uploading} />
        </motion.div>

        {/* Result Card */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{
                border: `2px solid ${result.status === 'verified' ? '#bbf7d0' : result.status === 'expired' ? '#fecaca' : '#fde68a'}`,
                borderRadius: '16px', padding: '20px 24px',
                background: result.status === 'verified' ? '#f0fdf4' : result.status === 'expired' ? '#fef2f2' : '#fffbeb',
              }}
            >
              <h3 style={{ margin: '0 0 12px', fontWeight: 800 }}>
                {result.status === 'verified' ? '🎉 Certificate Verified!' : result.status === 'expired' ? '❌ Certificate Expired' : '⏳ Sent for Review'}
              </h3>
              <p style={{ margin: '0 0 14px', color: '#555' }}>{result.message}</p>
              {result.extracted && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                  {[
                    ['Holder', result.extracted.holder_name],
                    ['Type', result.extracted.certificate_type],
                    ['Issuer', result.extracted.issuing_organization],
                    ['Expiry', result.extracted.expiry_date || 'None'],
                    ['Confidence', `${result.extracted.confidence}%`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: 'white', borderRadius: '8px', padding: '8px 12px', border: '1px solid #e5e7eb' }}>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase' }}>{k}</p>
                      <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: '0.88rem' }}>{v}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* My Certificates */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>My Certificates</h2>
            <span style={{ fontSize: '0.82rem', color: '#888' }}>{verifications.length} total</span>
          </div>

          {loadingList && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Loading...</div>
          )}

          {!loadingList && verifications.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '48px 24px',
              border: '2px dashed #e5e7eb', borderRadius: '16px', color: '#aaa',
            }}>
              <HiDocumentText size={36} style={{ marginBottom: '10px', opacity: 0.4 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No certificates uploaded yet</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem' }}>Upload your first certificate above to get a verified badge</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {verifications.map(v => <CertCard key={v.id} v={v} />)}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
