const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { extractNeed, getAllNeeds, deleteNeed } = require('../controllers/needController');

// POST /api/needs/extract — AI need extraction (open for MVP demo)
router.post('/extract', upload.single('image'), extractNeed);

// GET /api/needs — fetch all stored needs
router.get('/', getAllNeeds);

// DELETE /api/needs/:id — delete a need
router.delete('/:id', deleteNeed);

module.exports = router;