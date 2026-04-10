require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

// Allow requests from the Next.js dev server and production
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'VeriVolunte backend is running', status: 'ok' });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌿 VeriVolunte backend running on http://localhost:${PORT}\n`);
});
