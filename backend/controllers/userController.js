const { db } = require('../config/firebase');
const axios = require('axios');

// Geocode a location string → { lat, lng } using Nominatim (free)
// Helper – improved for Delhi
async function geocodeLocation(locationText) {
  if (!locationText || locationText.trim() === '' || locationText.toLowerCase() === 'unknown') {
    return null;
  }

  try {
    // Make the query much more Delhi-specific and structured
    let query = locationText.trim();
    if (!query.toLowerCase().includes('delhi') && !query.toLowerCase().includes('new delhi')) {
      query += ', Delhi, India';
    }

    const encoded = encodeURIComponent(query);
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&addressdetails=1&countrycodes=in`,
      {
        headers: { 
          'User-Agent': 'VeriVolunte-App/1.0 (contact: your-email@example.com)',  // Required by Nominatim
        },
        timeout: 8000
      }
    );

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      // Extra safety: only accept if it's clearly in Delhi / NCR
      const isDelhi = result.display_name.toLowerCase().includes('delhi') || 
                      result.address?.state?.toLowerCase().includes('delhi') ||
                      result.address?.city?.toLowerCase().includes('delhi');

      if (isDelhi) {
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          confidence: result.importance || 0.5   // Optional: you can store this too
        };
      }
    }
  } catch (err) {
    console.warn(`[Geocode] Failed for "${locationText}":`, err.message);
  }

  // Fallback: Default to a central Delhi point (e.g., India Gate) if geocoding fails
  console.warn(`[Geocode] Using fallback for: ${locationText}`);
  return { lat: 28.6129, lng: 77.2295 };   // India Gate / Central Delhi
}

// @desc    Register new user OR return existing profile on re-login
// @route   POST /api/users/register
// @access  Private (requires valid Firebase token)
const registerUser = async (req, res) => {
  try {
    const { uid, email } = req.user;

    const {
      name,
      role,
      mode, // 'login' or 'signup'
      // Volunteer fields
      skills,
      bio,
      location,
      availability,
      // NGO fields
      orgName,
      registrationNumber,
      website,
      contactPhone,
      focusAreas,
      orgDescription,
      foundedYear,
      address,
    } = req.body;

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    // ── LOGIN MODE ──────────────────────────────────────────────────────────
    if (mode === 'login') {
      if (!userDoc.exists) {
        return res.status(404).json({
          error: 'No account found. Please sign up first.',
          code: 'USER_NOT_FOUND',
        });
      }

      const existing = userDoc.data();

      // Ensure NGOs always have isVerified = true in dev mode
      if (existing.role === 'NGO' && existing.isVerified !== true) {
        await userRef.update({ isVerified: true });
        existing.isVerified = true;
      }

      return res.status(200).json({
        message: 'Login successful',
        user: existing,
      });
    }

    // ── SIGNUP MODE ─────────────────────────────────────────────────────────
    // If user already exists, return their existing profile
    if (userDoc.exists) {
      const existing = userDoc.data();

      if (existing.role === 'NGO' && existing.isVerified !== true) {
        await userRef.update({ isVerified: true });
        existing.isVerified = true;
      }

      return res.status(200).json({
        message: 'Account already exists. Logged you in.',
        user: existing,
        alreadyExists: true,
      });
    }

    // ── New user: create profile ─────────────────────────────────────────────
    const assignedRole = role === 'NGO' ? 'NGO' : 'Volunteer';

    let newUserProfile = {
      uid,
      email,
      name: name || email.split('@')[0],
      role: assignedRole,
      createdAt: new Date().toISOString(),
    };

    if (assignedRole === 'Volunteer') {
      // Geocode volunteer location for map heatmap
      const volCoords = await geocodeLocation(location);
      newUserProfile = {
        ...newUserProfile,
        skills:       skills       || '',
        bio:          bio          || '',
        location:     location     || '',
        availability: availability || '',
        lat: volCoords?.lat || null,
        lng: volCoords?.lng || null,
      };
    } else if (assignedRole === 'NGO') {
      newUserProfile = {
        ...newUserProfile,
        orgName:            orgName            || '',
        registrationNumber: registrationNumber || '',
        website:            website            || '',
        contactPhone:       contactPhone       || '',
        focusAreas:         focusAreas         || '',
        orgDescription:     orgDescription     || '',
        foundedYear:        foundedYear        || '',
        address:            address            || '',
        isVerified: true, // Dev: auto-verify. Production: set false + admin panel.
      };
    }

    await userRef.set(newUserProfile);

    res.status(201).json({
      message: 'User successfully created!',
      user: newUserProfile,
    });

  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ error: 'Failed to register user to database' });
  }
};

// @desc    Get the currently logged-in user's profile
// @route   GET /api/users/me
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found. Please register first.' });
    }

    res.status(200).json({ user: userDoc.data() });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// @desc    Get all events a volunteer has signed up for
// @route   GET /api/users/me/events
// @access  Private
const getMyParticipatedEvents = async (req, res) => {
  try {
    const { uid } = req.user;

    // Option 1: Preferred – Use the sub-collection you already create in participateInEvent
    const participationsSnapshot = await db
      .collectionGroup('participations')           // queries across all events' sub-collections
      .where('uid', '==', uid)
      .get();

    if (participationsSnapshot.empty) {
      return res.status(200).json([]);   // No events → return empty array
    }

    const eventPromises = [];
    participationsSnapshot.forEach(doc => {
      const eventId = doc.ref.parent.parent.id;   // Go up two levels: participations → event
      eventPromises.push(
        db.collection('events').doc(eventId).get()
      );
    });

    const eventDocs = await Promise.all(eventPromises);
    const events = eventDocs
      .filter(doc => doc.exists)
      .map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort by createdAt descending
    events.sort((a, b) => 
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    res.status(200).json(events);

  } catch (error) {
    console.error('Error fetching participated events:', error);
    // Better error response for debugging
    res.status(500).json({ 
      error: 'Failed to retrieve your participated events',
      details: error.message,
      code: error.code 
    });
  }
};

module.exports = {
  registerUser,
  getMyProfile,
  getMyParticipatedEvents,
};
