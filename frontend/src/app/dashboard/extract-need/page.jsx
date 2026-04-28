'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiSparkles, HiPhoto, HiDocumentText, HiXMark, HiCheckCircle, HiExclamationTriangle, HiCloudArrowUp } from 'react-icons/hi2';
import { useAuth } from '@/context/AuthContext';
import { extractNeed } from '@/lib/api';
import styles from './page.module.css';

const SOURCE_OPTIONS = [
  { value: 'ngo_verified', label: 'NGO Verified', badge: 'High Trust', icon: '🏛️', color: 'green' },
  { value: 'volunteer',    label: 'Field Volunteer', badge: 'Medium Trust', icon: '🙋', color: 'yellow' },
  { value: 'social_media', label: 'Social Media',  badge: 'Low Trust',    icon: '📱', color: 'red' },
];

const URGENCY_COLOR = { high: '#dc2626', medium: '#d97706', low: '#16a34a' };
const URGENCY_BG    = { high: '#fef2f2', medium: '#fffbeb', low: '#f0fdf4' };

function ConfidenceBar({ value }) {
  const color = value >= 75 ? '#16a34a' : value >= 50 ? '#d97706' : '#dc2626';
  return (
    <div className={styles.confidenceWrap}>
      <div className={styles.confidenceTrack}>
        <motion.div
          className={styles.confidenceFill}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ background: color }}
        />
      </div>
      <span className={styles.confidenceLabel} style={{ color }}>{value}%</span>
    </div>
  );
}

export default function ExtractNeedPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [mode, setMode]         = useState('text');
  const [content, setContent]   = useState('');
  const [source, setSource]     = useState('ngo_verified');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]     = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file.'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const clearImage = () => { setImageFile(null); setImagePreview(null); };

  const handleSubmit = async () => {
    if (mode === 'text' && !content.trim()) {
      toast.error('Please enter a message to extract.'); return;
    }
    if (mode === 'image' && !imageFile) {
      toast.error('Please upload an image.'); return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append('source', source);
      if (mode === 'text') {
        fd.append('content', content.trim());
      } else {
        fd.append('image', imageFile);
      }

      const data = await extractNeed(fd);
      setResult(data);
      toast.success('Need extracted successfully!');
    } catch (err) {
      const msg = err?.response?.data?.details || err?.response?.data?.error || 'Extraction failed. Check if the backend is running.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className={styles.page}>
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />

      <div className={styles.container}>
        {/* Header */}
        <motion.div className={styles.header} initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button className={styles.backBtn} onClick={() => router.push('/dashboard')} id="extract-back-btn">
            <HiArrowLeft size={16} /> Back to Dashboard
          </button>
          <div className={styles.headerText}>
            <div className={styles.badgeRow}>
              <span className={styles.aiBadge}><HiSparkles size={13} /> AI-Powered</span>
              <span className={styles.geminiBadge}>Gemini + Vision API</span>
            </div>
            <h1 className={styles.title}>AI Need Extraction Engine</h1>
            <p className={styles.sub}>Paste a WhatsApp message or upload a handwritten note — our AI instantly converts it into a structured, actionable task.</p>
          </div>
        </motion.div>

        <div className={styles.layout}>
          {/* Left column — Input */}
          <motion.div className={styles.inputCol} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Input Type</h3>
              <div className={styles.modeToggle}>
                <button className={[styles.modeBtn, mode === 'text' ? styles.modeActive : ''].join(' ')} onClick={() => setMode('text')} id="mode-text-btn">
                  <HiDocumentText size={17} /> Text / WhatsApp
                </button>
                <button className={[styles.modeBtn, mode === 'image' ? styles.modeActive : ''].join(' ')} onClick={() => setMode('image')} id="mode-image-btn">
                  <HiPhoto size={17} /> Upload Image
                </button>
              </div>

              <AnimatePresence mode="wait">
                {mode === 'text' ? (
                  <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <label className={styles.label} htmlFor="whatsapp-input">WhatsApp Message / Text Input</label>
                    <div className={styles.whatsappWrap}>
                      <div className={styles.whatsappHeader}><span>📱</span> <span>WhatsApp Message</span></div>
                      <textarea id="whatsapp-input" className={styles.textarea} value={content} onChange={(e) => setContent(e.target.value)}
                        placeholder={'Paste your message here...\n\nExamples:\n"Need 2 doctors urgently in Sector 5"\n"Food supplies required at camp 3, 50 people"\n"Urgently need first-aid volunteers near the river"'}
                        rows={8}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="image" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <label className={styles.label}>Upload Image / Handwritten Note</label>
                    {!imagePreview ? (
                      <div className={[styles.dropZone, dragging ? styles.dropActive : ''].join(' ')}
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileRef.current?.click()} id="image-dropzone">
                        <HiCloudArrowUp size={36} className={styles.dropIcon} />
                        <p className={styles.dropText}>Drag & drop or <span>click to upload</span></p>
                        <p className={styles.dropHint}>JPG, PNG, GIF up to 10MB</p>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
                      </div>
                    ) : (
                      <div className={styles.previewWrap}>
                        <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                        <button className={styles.clearImg} onClick={clearImage}><HiXMark size={16} /></button>
                        <p className={styles.fileName}>{imageFile?.name}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Source Trust */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Source Type</h3>
              <p className={styles.cardSub}>How reliable is this information?</p>
              <div className={styles.sourceGrid}>
                {SOURCE_OPTIONS.map((s) => (
                  <button key={s.value}
                    className={[styles.sourceBtn, source === s.value ? styles.sourceActive : ''].join(' ')}
                    onClick={() => setSource(s.value)} id={`source-${s.value}`}>
                    <span className={styles.sourceIcon}>{s.icon}</span>
                    <span className={styles.sourceName}>{s.label}</span>
                    <span className={[styles.sourceBadge, styles[`badge${s.color}`]].join(' ')}>{s.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            <button className={styles.extractBtn} onClick={handleSubmit} disabled={submitting} id="extract-submit-btn">
              {submitting ? (<><span className={styles.spinner} /> Extracting with AI...</>) : (<><HiSparkles size={18} /> Extract Need with Gemini AI</>)}
            </button>
          </motion.div>

          {/* Right column — Results */}
          <motion.div className={styles.resultCol} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <AnimatePresence mode="wait">
              {!result && !submitting && (
                <motion.div key="empty" className={styles.emptyResult} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className={styles.emptyIcon}>🤖</div>
                  <h3>AI Results Appear Here</h3>
                  <p>Enter a message or upload an image and click <strong>Extract Need</strong> to see the structured output.</p>
                  <div className={styles.examplePills}>
                    {['Location', 'Urgency', 'Skill Required', 'People Needed', 'Confidence %'].map(tag => (
                      <span key={tag} className={styles.pill}>{tag}</span>
                    ))}
                  </div>
                </motion.div>
              )}

              {submitting && (
                <motion.div key="loading" className={styles.loadingResult} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className={styles.aiSpinner} />
                  <p className={styles.loadingText}>Gemini AI is analyzing your input...</p>
                  <div className={styles.loadingSteps}>
                    <div className={styles.loadingStep}>✅ Input received</div>
                    <div className={styles.loadingStep}>{mode === 'image' ? '🔍 Vision API extracting text...' : '📝 Processing text...'}</div>
                    <div className={styles.loadingStep}>⚡ Gemini understanding context...</div>
                    <div className={styles.loadingStep}>📊 Generating structured output...</div>
                  </div>
                </motion.div>
              )}

              {result && !submitting && (
                <motion.div key="result" className={styles.resultCard} initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4 }}>
                  <div className={styles.resultHeader}>
                    <div className={styles.resultSuccess}><HiCheckCircle size={20} /> Need Extracted Successfully</div>
                    <span className={styles.needId}>ID: {result.need_id?.slice(0, 8)}...</span>
                  </div>

                  <div className={styles.resultGrid}>
                    <div className={styles.resultField}><div className={styles.resultFieldLabel}>📋 Title</div><div className={styles.resultFieldValue}>{result.extracted?.title}</div></div>
                    <div className={styles.resultField}><div className={styles.resultFieldLabel}>🛠 Skill Required</div><div className={styles.resultFieldValue}>{result.extracted?.skill_required}</div></div>
                    <div className={styles.resultField}><div className={styles.resultFieldLabel}>📍 Location</div><div className={styles.resultFieldValue}>{result.extracted?.location}</div></div>
                    <div className={styles.resultField}><div className={styles.resultFieldLabel}>👥 People Needed</div><div className={styles.resultFieldValue}>{result.extracted?.people_needed}</div></div>
                    <div className={styles.resultField}>
                      <div className={styles.resultFieldLabel}>🚨 Urgency</div>
                      <div className={styles.urgencyBadge} style={{ color: URGENCY_COLOR[result.extracted?.urgency], background: URGENCY_BG[result.extracted?.urgency] }}>
                        {result.extracted?.urgency?.toUpperCase()}
                      </div>
                    </div>
                    <div className={styles.resultField}>
                      <div className={styles.resultFieldLabel}>🔒 Source Trust</div>
                      <div className={[styles.trustBadge, result.extracted?.source_trust === 'high' ? styles.trustHigh : result.extracted?.source_trust === 'medium' ? styles.trustMedium : styles.trustLow].join(' ')}>
                        {result.extracted?.source_trust?.toUpperCase()} TRUST
                      </div>
                    </div>
                  </div>

                  <div className={styles.confidenceSection}>
                    <div className={styles.confidenceTitleRow}>
                      <span className={styles.confidenceTitle}>🎯 AI Confidence Score</span>
                      {result.extracted?.confidence >= 75
                        ? <span className={styles.confHigh}>High Confidence</span>
                        : result.extracted?.confidence >= 50
                          ? <span className={styles.confMed}><HiExclamationTriangle size={13} /> Review Suggested</span>
                          : <span className={styles.confLow}><HiExclamationTriangle size={13} /> Human Review Needed</span>
                      }
                    </div>
                    <ConfidenceBar value={result.extracted?.confidence || 0} />
                  </div>

                  <div className={styles.resultActions}>
                    <button className={styles.extractAgainBtn} onClick={() => setResult(null)}>✨ Extract Another</button>
                    <button className={styles.viewMapBtn} onClick={() => router.push('/dashboard')}>📊 View Dashboard</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
