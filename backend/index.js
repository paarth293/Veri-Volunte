require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());

app.use(express.json());

// Main API Routes
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Backend is fully functional'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});