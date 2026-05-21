// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 📂 1. Routes Ko Import Kiya (User aur Agenda Dono)
const userRoutes = require('./routes/userRoutes');
const agendaRoutes = require('./routes/agendaRoutes');

const app = express();

// Body Parser Middleware (JSON data read karne ke liye)
app.use(express.json());

// 🌐 2. Dynamic Environment-Based CORS Setup
const allowedOrigins = [
    process.env.FRONTEND_URL_LOCAL,
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL_PROD
].filter(Boolean); // Filter out undefined values

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Blocked by CORS Configuration'));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-auth-token'],
    credentials: true
}));

// Global Headers Setup (Pre-flight OPTIONS crash protection)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-auth-token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Base Route for Testing
app.get('/', (req, res) => {
    res.send("Radhe Radhe! ISKCON Patna Meeting Central Engine is Running Clean...");
});

// 🔌 3. Routes Ko Express Ke Sath Connect/Register Kiya
app.use('/api/users', userRoutes);     // 👈 Yeh line ab register ho gayi!
app.use('/api/agendas', agendaRoutes); // 👈 Yeh line bhi register ho gayi!

// 🗄️ 4. Database Connection Setup
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/iskcon-meetings';

mongoose.connect(mongoURI)
  .then(() => {
      console.log("✅ Radhe Radhe! MongoDB Connected Smoothly to a Fresh Database.");
  })
  .catch(err => {
      console.error("❌ Database Connection Error: ", err.message);
  });

// 🚀 5. Port Listener Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server successfully booted on port ${PORT}`);
});