// backend/src/routes/notificationRoutes.js

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');  // Import
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.protect, notificationController.getAllNotifications);
router.get('/unread', authMiddleware.protect, notificationController.getUnreadNotifications);
router.put('/:id/read', authMiddleware.protect, notificationController.markAsRead);
router.put('/read', authMiddleware.protect, notificationController.markAllAsRead); // Mark all as read
// router.post('/', authMiddleware.protect, notificationController.createNotification);  // Thường không cần route riêng để tạo notification

module.exports = router;