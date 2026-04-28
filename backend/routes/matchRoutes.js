const express = require('express');
const router = express.Router();
const { matchVolunteers, getOpenNeeds } = require('../controllers/matchController');

// GET /api/match/needs — get all open needs that can be matched
router.get('/needs', getOpenNeeds);

// POST /api/match/:needId — run the matching engine on a specific need
router.post('/:needId', matchVolunteers);

module.exports = router;
