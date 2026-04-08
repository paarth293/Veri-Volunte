const express = require('express');
const router = express.Router();

const { createEvent, getAllEvents, participateInEvent } = require('../controllers/eventController');
const { verifyToken } = require('../middleware/authMiddleware');
const { isNGO } = require('../middleware/roleMiddleware');

// Route: GET /api/events
// Publicly accessible to fetch all events
router.get('/', getAllEvents);

// Route: POST /api/events
// Protected: Requires valid login AND the user must be verified as an NGO
router.post('/', verifyToken, isNGO, createEvent);

// Route: POST /api/events/:id/participate
// Protected: Requires login only. Any volunteer can sign up.
router.post('/:id/participate', verifyToken, participateInEvent);

module.exports = router;