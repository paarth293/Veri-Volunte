const { db } = require('../config/firebase');

const registerUser = async (req, res) => {
    try {
        const { uid, email } = req.user;

        const { name, role } = req.body;

        const assignedRole = role === 'NGO' ? 'NGO' : 'Volunteer';

        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if(userDoc.exists) {
            return res.status(200).json({
                message: 'Login successful',
                user: userDoc.data()
            });
        }

        const newUserProfile = {
            uid,
            email,
            name: name || '',
            role: assignedRole,
            createdAt: new Date().toISOString()
    };

    await userRef.set(newUserProfile);

    res.status(201).json({
      message: 'User successfully created in database!',
      user: newUserProfile
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

module.exports = {
  registerUser,
  getMyProfile
};