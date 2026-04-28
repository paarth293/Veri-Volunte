'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiUsers, HiLightningBolt, HiCheckCircle, HiExclamationCircle, HiLocationMarker, HiClock } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';
import { getOpenNeeds, matchVolunteers } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import styles from './page.module.css';

export default function MatchVolunteersPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [needs, setNeeds] = useState([]);
  const [fetchingNeeds, setFetchingNeeds] = useState(true);
  const [selectedNeedId, setSelectedNeedId] = useState('');
  
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    fetchNeeds();
  }, [user, loading, router]);

  const fetchNeeds = async () => {
    try {
      const data = await getOpenNeeds();
      setNeeds(data.needs || []);
      if (data.needs?.length > 0) {
        setSelectedNeedId(data.needs[0].id);
      }
    } catch (error) {
      toast.error('Failed to fetch open needs');
    } finally {
      setFetchingNeeds(false);
    }
  };

  const handleMatch = async () => {
    if (!selectedNeedId) return;
    setMatching(true);
    setMatchResult(null);

    try {
      const data = await matchVolunteers(selectedNeedId, { limit: 10 });
      setMatchResult(data);
      if (data.matches.length === 0) {
        toast.error('No volunteers found matching this need.');
      } else {
        toast.success(`Found ${data.matches.length} matching volunteers!`);
      }
    } catch (error) {
      toast.error('Matching engine failed');
    } finally {
      setMatching(false);
    }
  };

  if (loading) return null;

  return (
    <div className={styles.page}>
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.container}>
        
        {/* Header */}
        <motion.div className={styles.header} initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <button className={styles.backBtn} onClick={() => router.push('/dashboard')}>
            <HiArrowLeft size={16} /> Back to Dashboard
          </button>
          <div>
            <h1 className={styles.title}>Smart Volunteer Matching</h1>
            <p className={styles.sub}>Find the most qualified volunteers based on skill relevance, distance, availability, and trust scores.</p>
          </div>
        </motion.div>

        {/* Action Bar */}
        <motion.div className={styles.actionBar} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className={styles.selectorWrap}>
            <label className={styles.label}>Select a Need to match volunteers to:</label>
            {fetchingNeeds ? (
              <div className={styles.loadingNeeds}>Loading needs...</div>
            ) : needs.length === 0 ? (
              <div className={styles.noNeeds}>No open needs found. Extract a need first.</div>
            ) : (
              <select 
                className={styles.select} 
                value={selectedNeedId} 
                onChange={(e) => {
                  setSelectedNeedId(e.target.value);
                  setMatchResult(null);
                }}
              >
                {needs.map(need => (
                  <option key={need.id} value={need.id}>
                    {need.title} ({need.skill_required || 'General'}) — {need.location || 'Unknown location'}
                  </option>
                ))}
              </select>
            )}
          </div>
          <button 
            className={styles.matchBtn} 
            onClick={handleMatch} 
            disabled={!selectedNeedId || matching || needs.length === 0}
          >
            {matching ? 'Running Algorithm...' : 'Find Matches'}
          </button>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {matching && (
            <motion.div key="loading" className={styles.loadingResult} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className={styles.spinner} />
              <h3>Scanning Database...</h3>
              <p>Analyzing skills, computing distances, and calculating trust scores.</p>
            </motion.div>
          )}

          {matchResult && !matching && (
            <motion.div key="result" className={styles.resultsGrid} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className={styles.resultHeader}>
                <h2>Top Matches for: <span>{matchResult.need_title}</span></h2>
                <div className={styles.statsRow}>
                  <span>{matchResult.total_volunteers_scanned} Users Scanned</span>
                  <span>{matchResult.matches_found} Found</span>
                  <span><Badge color={matchResult.need_urgency === 'high' ? 'error' : 'success'}>{matchResult.need_urgency} Urgency</Badge></span>
                </div>
              </div>

              {matchResult.matches.map((match, i) => (
                <motion.div key={match.volunteer_id} className={styles.matchCard} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className={styles.matchTop}>
                    <div className={styles.matchAvatar}>{match.name.charAt(0).toUpperCase()}</div>
                    <div className={styles.matchInfo}>
                      <h3>{match.name} {match.isVerified && <HiCheckCircle className={styles.verifiedIcon} title="Verified Volunteer" />}</h3>
                      <p>{match.skills}</p>
                    </div>
                    <div className={styles.matchScore}>
                      <span className={styles.scoreValue} style={{ color: match.scores.total >= 80 ? '#16a34a' : match.scores.total >= 50 ? '#d97706' : '#dc2626' }}>
                        {match.scores.total}%
                      </span>
                      <span className={styles.scoreLabel}>Match</span>
                    </div>
                  </div>

                  <div className={styles.scoreBreakdown}>
                    <div className={styles.scoreItem}>
                      <span className={styles.sLabel}>Skill</span>
                      <span className={styles.sValue}>{match.scores.skill}</span>
                    </div>
                    <div className={styles.scoreItem}>
                      <span className={styles.sLabel}>Distance</span>
                      <span className={styles.sValue}>{match.scores.distance}</span>
                    </div>
                    <div className={styles.scoreItem}>
                      <span className={styles.sLabel}>Time</span>
                      <span className={styles.sValue}>{match.scores.availability}</span>
                    </div>
                    <div className={styles.scoreItem}>
                      <span className={styles.sLabel}>Trust</span>
                      <span className={styles.sValue}>{match.scores.trust}</span>
                    </div>
                  </div>

                  <div className={styles.matchMeta}>
                    <span><HiLocationMarker size={14} /> {match.location || 'Unknown location'}</span>
                    <span><HiClock size={14} /> {match.availability || 'Unknown availability'}</span>
                  </div>

                  <button className={styles.contactBtn}>Contact Volunteer</button>
                </motion.div>
              ))}

              {matchResult.matches.length === 0 && (
                <div className={styles.emptyGrid}>
                  <HiExclamationCircle size={48} className={styles.emptyIcon} />
                  <h3>No matches found</h3>
                  <p>Try reducing the requirements or wait for more volunteers to register.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
