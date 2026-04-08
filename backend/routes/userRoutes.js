const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', verifyToken, registerUser);

module.exports = router;
