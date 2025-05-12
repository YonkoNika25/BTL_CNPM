// backend/src/app.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routers/authRoutes');
const attendanceRoutes = require('./routers/attendanceRoutes');
const classRoutes = require('./routers/classRoutes');
const notificationRoutes = require('./routers/notificationRoutes');
const userRoutes = require('./routers/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);



// Error handling middleware (đặt cuối cùng)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log lỗi chi tiết
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;