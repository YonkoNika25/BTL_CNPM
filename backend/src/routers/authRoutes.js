// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Import controller
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

// Định nghĩa các routes, sử dụng controller
router.post('/register',  validationMiddleware.validate(validationMiddleware.userValidationRules()), authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware.protect, authController.getProfile);
router.put('/profile', authMiddleware.protect, authController.updateProfile);
router.put('/change-password', authMiddleware.protect, authController.changePassword);

module.exports = router;