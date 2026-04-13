const { db } = require('../config/firebase');

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
      newUserProfile = {
        ...newUserProfile,
        skills:       skills       || '',
        bio:          bio          || '',
        location:     location     || '',
        availability: availability || '',
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

    const eventsSnapshot = await db
      .collection('events')
      .where('participants', 'array-contains', uid)
      .orderBy('createdAt', 'desc')
      .get();

    const events = [];
    eventsSnapshot.forEach(doc => {
      events.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching participated events:', error);
    res.status(500).json({ error: 'Failed to retrieve your participated events' });
  }
};

module.exports = {
  registerUser,
  getMyProfile,
  getMyParticipatedEvents,
};
