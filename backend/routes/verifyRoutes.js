const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  uploadCertificate, 
  getMyVerifications, 
  lookupVolunteerTrust,
  getTrustRecordsByUID,
  getMyTrustSummary,
} = require('../controllers/verifyController');
const { verifyToken } = require('../middleware/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP, and PDF files are allowed'));
    }
  }
});

// Wrapper to catch Multer errors
const uploadMiddleware = (req, res, next) => {
  upload.single('certificate')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// ── Existing routes ────────────────────────────────────────────
router.post('/upload', verifyToken, uploadMiddleware, uploadCertificate);
router.get('/mine', verifyToken, getMyVerifications);

// ── Feature 6: Cross-NGO Trust Sharing ────────────────────────
// NGO looks up a volunteer's trust status by email
router.get('/trust/lookup', verifyToken, lookupVolunteerTrust);

// Get trust records for a specific volunteer UID (public-ish, used by NGOs)
router.get('/trust/:volunteerUid', verifyToken, getTrustRecordsByUID);

// Volunteer sees their own cross-NGO trust summary
router.get('/my-trust', verifyToken, getMyTrustSummary);

module.exports = router;
