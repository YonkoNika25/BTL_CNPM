// backend/src/routes/classRoutes.js
const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController'); // Import
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
router.post('/', authMiddleware.protect, roleMiddleware.restrictTo('teacher', 'admin'), classController.createClass);
router.get('/:id', authMiddleware.protect, classController.getClassById);
router.put('/:id', authMiddleware.protect, roleMiddleware.restrictTo('teacher', 'admin'), classController.updateClass);
router.delete('/:id', authMiddleware.protect, roleMiddleware.restrictTo('teacher', 'admin'), classController.deleteClass);
router.get('/', authMiddleware.protect, classController.getAllClasses);
router.get('/teacher/:teacherId', authMiddleware.protect, classController.getClassesByTeacherId);
router.post('/:classId/students', authMiddleware.protect, roleMiddleware.restrictTo('teacher', 'admin'), classController.addStudentToClass);
router.delete('/:classId/students/:userId', authMiddleware.protect, roleMiddleware.restrictTo('teacher', 'admin'), classController.removeStudentFromClass);
router.get('/:classId/students', authMiddleware.protect, classController.getStudentsInClass);

module.exports = router;