const express = require('express');
const router = express.Router();

const { createEvent, getAllEvents, getEventById, participateInEvent } = require('../controllers/eventController');
const { verifyToken } = require('../middleware/authMiddleware');
const { isNGO } = require('../middleware/roleMiddleware');

// Route: GET /api/events
router.get('/', getAllEvents);

// Route: GET /api/events/:id
router.get('/:id', getEventById);

// Route: POST /api/events
router.post('/', verifyToken, isNGO, createEvent);

// Route: POST /api/events/:id/participate
router.post('/:id/participate', verifyToken, participateInEvent);

module.exports = router;