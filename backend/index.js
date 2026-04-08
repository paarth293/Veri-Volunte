require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

app.use(cors());

app.use(express.json());

// Main API Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Backend is fully functional'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});