const express = require('express');
const router = express.Router();
const { getAllNeedsForMap, getAllEventsForMap, getVolunteersForMap } = require('../controllers/mapController');

router.get('/needs', getAllNeedsForMap);
router.get('/events', getAllEventsForMap);     // ← New
router.get('/volunteers', getVolunteersForMap);

module.exports = router;