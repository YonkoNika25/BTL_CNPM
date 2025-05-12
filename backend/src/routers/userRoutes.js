//backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
router.get('/', authMiddleware.protect, roleMiddleware.restrictTo('admin'), userController.getAllUsers);
router.get('/students', authMiddleware.protect, roleMiddleware.restrictTo('admin', 'teacher'), userController.getStudents);
router.get('/teachers', authMiddleware.protect, roleMiddleware.restrictTo('admin'), userController.getTeachers);
router.get('/:id', authMiddleware.protect, roleMiddleware.restrictTo('admin'),userController.getUserById); // Hoặc cho phép user xem profile của chính họ
router.post('/', authMiddleware.protect, roleMiddleware.restrictTo('admin'), userController.createUser);
router.put('/:id', authMiddleware.protect, roleMiddleware.restrictTo('admin'), userController.updateUser);
router.delete('/:id', authMiddleware.protect, roleMiddleware.restrictTo('admin'), userController.deleteUser);

module.exports = router;