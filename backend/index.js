require('dotenv').config();
const { db } = require('./config/firebase');
const express = require('express');
const cors = require('cors');

const verifyRoutes = require('./routes/verifyRoutes');

// Route imports
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const needRoutes = require('./routes/needRoutes');
const matchRoutes = require('./routes/matchRoutes');
const mapRoutes = require('./routes/mapRoutes');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// CORS middleware below handles pre-flight requests automatically
// app.options('(.*)', cors()); 

app.use(express.json());

// ── API Routes ──────────────────────────────────────────────
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/needs', needRoutes);       // Feature 1: AI Need Extraction
app.use('/api/match', matchRoutes);      // Feature 2: Volunteer Matching
app.use('/api/map', mapRoutes);          // Feature 3: Map Visualization
app.use('/api/verify', verifyRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'VeriVolunte Backend is running',
    routes: {
      users: '/api/users',
      events: '/api/events',
      needs: '/api/needs',
      match: '/api/match',
      map: '/api/map',
    }
  });
});

// ── Firestore health check endpoint ─────────────────────────
app.get('/api/health/firestore', async (req, res) => {
  try {
    // Try a simple read operation
    const testRef = db.collection('_health_check').doc('test');
    await testRef.set({ checked_at: new Date().toISOString() });
    await testRef.get();
    await testRef.delete();
    res.json({ status: 'ok', message: 'Firestore is connected and working' });
  } catch (error) {
    console.error('Firestore health check failed:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Firestore connection failed',
      error: error.message,
      code: error.code || 'UNKNOWN'
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  // Startup Firestore connectivity check
  try {
    const testRef = db.collection('_health_check').doc('startup');
    await testRef.set({ started_at: new Date().toISOString() });
    await testRef.delete();
    console.log('✅ Firestore connection verified successfully');
  } catch (error) {
    console.error('❌ Firestore connection FAILED:', error.message);
    console.error('   Make sure Cloud Firestore API is enabled at:');
    console.error('   https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=veri-volunte');
    console.error('   Also ensure a Firestore database has been CREATED in the Firebase Console.');
  }
});