const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const diseaseRoutes = require('./routes/diseaseRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/disease', diseaseRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send('KrishiSathi Backend API (Public Mode) is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
