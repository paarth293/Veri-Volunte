const express = require('express');
const router = express.Router();
const { registerUser, getMyProfile, getMyParticipatedEvents } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Route: POST /api/users/register
router.post('/register', verifyToken, registerUser);

// Route: GET /api/users/me
router.get('/me', verifyToken, getMyProfile);

// Route: GET /api/users/me/events
router.get('/me/events', verifyToken, getMyParticipatedEvents);

module.exports = router;
