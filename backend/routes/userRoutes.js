const express = require('express');
const router = express.Router();
const { registerUser, getMyProfile } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Route: POST /api/users/register
router.post('/register', verifyToken, registerUser);

// Route: GET /api/users/me
router.get('/me', verifyToken, getMyProfile);

module.exports = router;
