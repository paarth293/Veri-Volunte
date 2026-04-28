const { db } = require('../config/firebase');

// ─────────────────────────────────────────────
// SCORING HELPERS
// ─────────────────────────────────────────────

/**
 * Skill match score (0-100)
 * Exact keyword match = 100, partial = 60, none = 0
 */
function scoreSkill(volunteerSkills, requiredSkill) {
  if (!volunteerSkills || !requiredSkill) return 0;

  const skills = volunteerSkills.toLowerCase().split(',').map(s => s.trim());
  const required = requiredSkill.toLowerCase().trim();

  // Exact match
  if (skills.includes(required)) return 100;

  // Partial / fuzzy match (substring check)
  for (const s of skills) {
    if (s.includes(required) || required.includes(s)) return 60;
  }

  // Related skills mapping
  const relatedSkills = {
    'doctor': ['medical', 'healthcare', 'physician', 'surgeon', 'paramedic', 'nurse'],
    'first aid': ['medical', 'cpr', 'emergency', 'healthcare', 'paramedic'],
    'driver': ['transport', 'logistics', 'vehicle'],
    'cooking': ['food', 'kitchen', 'chef', 'catering'],
    'counseling': ['mental health', 'psychology', 'therapy', 'social work'],
    'teaching': ['education', 'tutor', 'trainer'],
    'construction': ['building', 'repair', 'carpentry', 'plumber', 'electrician'],
    'rescue': ['swimming', 'lifeguard', 'emergency', 'firefighting'],
  };

  for (const [key, related] of Object.entries(relatedSkills)) {
    if (required.includes(key) || key.includes(required)) {
      for (const s of skills) {
        if (related.some(r => s.includes(r) || r.includes(s))) return 40;
      }
    }
  }

  return 0;
}

/**
 * Distance score (0-100)
 * Same area name → 100, otherwise basic string comparison
 */
function scoreDistance(volunteerLocation, needLocation) {
  if (!volunteerLocation || !needLocation) return 30; // unknown → neutral

  const vLoc = volunteerLocation.toLowerCase().trim();
  const nLoc = needLocation.toLowerCase().trim();

  if (vLoc === nLoc) return 100;
  if (vLoc.includes(nLoc) || nLoc.includes(vLoc)) return 75;

  // City-level match
  const vCity = vLoc.split(',').pop()?.trim();
  const nCity = nLoc.split(',').pop()?.trim();
  if (vCity && nCity && (vCity === nCity || vCity.includes(nCity) || nCity.includes(vCity))) return 50;

  return 15; // far away
}

/**
 * Availability score (0-100)
 */
function scoreAvailability(availability) {
  if (!availability) return 30;
  const a = availability.toLowerCase();
  if (a === 'available' || a === 'full-time' || a === 'anytime') return 100;
  if (a === 'weekends' || a === 'part-time') return 60;
  if (a === 'busy' || a === 'unavailable') return 0;
  return 50; // unrecognized → medium
}

/**
 * Trust / verification score (0-100)
 */
function scoreTrust(volunteer) {
  let score = 30; // base
  if (volunteer.isVerified) score += 50;
  if (volunteer.badges && volunteer.badges.length > 0) score += 20;
  return Math.min(score, 100);
}

// ─────────────────────────────────────────────
// MAIN MATCHING ENDPOINT
// ─────────────────────────────────────────────

/**
 * POST /api/match/:needId
 * Find and rank the best volunteers for a given need.
 * 
 * Body (optional):
 *   weights: { skill, distance, availability, trust } (default: 40, 25, 20, 15)
 *   limit: number (default: 10)
 */
const matchVolunteers = async (req, res) => {
  try {
    const { needId } = req.params;

    // 1. Get the need document
    const needDoc = await db.collection('needs').doc(needId).get();
    if (!needDoc.exists) {
      return res.status(404).json({ error: 'Need not found' });
    }

    const need = needDoc.data();

    // 2. Get configurable weights (or use defaults)
    const weights = req.body.weights || {
      skill: 40,
      distance: 25,
      availability: 20,
      trust: 15,
    };

    const actualSkillRequired = need.skill_required || need.skill || '';

    // Dynamic weight adjustment based on urgency
    if (need.urgency === 'high') {
      weights.distance += 10;
      weights.skill += 5;
      weights.availability -= 10;
      weights.trust -= 5;
    }

    const limit = req.body.limit || 10;

    // 3. Fetch all volunteers from Firestore
    const usersSnapshot = await db
      .collection('users')
      .where('role', '==', 'Volunteer')
      .get();

    if (usersSnapshot.empty) {
      return res.status(200).json({
        need_id: needId,
        need_title: need.title,
        matches: [],
        message: 'No volunteers registered yet',
      });
    }

    // 4. Score each volunteer
    const scoredVolunteers = [];

    usersSnapshot.forEach(doc => {
      const vol = { id: doc.id, ...doc.data() };

      const skillScore = scoreSkill(vol.skills, actualSkillRequired);
      // Give a generous distance default for the demo if it's unknown
      const distanceScore = scoreDistance(vol.location, need.location) === 30 ? 75 : scoreDistance(vol.location, need.location);
      const availabilityScore = scoreAvailability(vol.availability);
      const trustScore = scoreTrust(vol);

      // Weighted total
      let totalScore =
        (skillScore * weights.skill +
          distanceScore * weights.distance +
          availabilityScore * weights.availability +
          trustScore * weights.trust) /
        (weights.skill + weights.distance + weights.availability + weights.trust);

      // Penalize severely if the volunteer has absolutely 0 relevant skills
      if (skillScore === 0) {
         totalScore *= 0.2; 
      }

      // Only include if they have SOME relevance
      if (totalScore > 10) {
        scoredVolunteers.push({
          volunteer_id: vol.id,
          name: vol.name || 'Unknown',
          email: vol.email,
          skills: vol.skills || '',
          location: vol.location || '',
          availability: vol.availability || '',
          isVerified: vol.isVerified || false,
          scores: {
            skill: Math.round(skillScore),
            distance: Math.round(distanceScore),
            availability: Math.round(availabilityScore),
            trust: Math.round(trustScore),
            total: Math.round(totalScore),
          },
        });
      }
    });

    // 5. Sort by total score (descending) and limit
    scoredVolunteers.sort((a, b) => b.scores.total - a.scores.total);
    const topMatches = scoredVolunteers.slice(0, limit);

    // 6. Return results
    return res.status(200).json({
      need_id: needId,
      need_title: need.title,
      need_skill: need.skill_required,
      need_location: need.location,
      need_urgency: need.urgency,
      weights_used: weights,
      total_volunteers_scanned: usersSnapshot.size,
      matches_found: topMatches.length,
      matches: topMatches,
    });

  } catch (error) {
    console.error('Error matching volunteers:', error);
    return res.status(500).json({
      error: 'Matching failed',
      details: error.message,
    });
  }
};

/**
 * GET /api/match/needs
 * Get all open needs that can be matched
 */
const getOpenNeeds = async (req, res) => {
  try {
    const snapshot = await db
      .collection('needs')
      .where('status', '==', 'open')
      .get();

    const needs = [];
    snapshot.forEach(doc => {
      needs.push({ id: doc.id, ...doc.data() });
    });

    // Sort in memory to avoid Firestore composite index requirement
    needs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json({ needs });
  } catch (error) {
    console.error('Error fetching open needs:', error);
    return res.status(500).json({ error: 'Failed to fetch open needs' });
  }
};

module.exports = { matchVolunteers, getOpenNeeds };
