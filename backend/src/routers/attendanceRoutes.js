// backend/src/routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController'); // Import
const authMiddleware = require('../middleware/authMiddleware'); // Import nếu cần xác thực
const roleMiddleware = require('../middleware/roleMiddleware');
const { body } = require('express-validator');
router.post('/', authMiddleware.protect, attendanceController.createAttendance);
router.get('/class/:classId', authMiddleware.protect, attendanceController.getAttendanceByClassAndDate); // Thêm query parameters: date, limit, offset
router.get('/user/:userId', authMiddleware.protect, attendanceController.getAttendanceByUserAndClass); // Thêm query parameters: classId, limit, offset
router.get('/summary/:classId', authMiddleware.protect, roleMiddleware.restrictTo('teacher', 'admin'), attendanceController.getAttendanceSummaryByClass);


// Tạo bản ghi điểm danh (Manual hoặc QR)
router.post(
    '/',
    authMiddleware.protect,
    [ // Validation cơ bản
        body('attendance_type').isIn(['manual', 'QR']).withMessage('Invalid attendance type'),
        // Thêm các validation khác nếu cần dựa trên type
    ],
    attendanceController.createAttendance
);

// Tạo dữ liệu QR Code (GV)
router.post(
    '/qr/generate/:classId',
    authMiddleware.protect,
    roleMiddleware.restrictTo('teacher'), // Chỉ teacher
    attendanceController.generateQRCodeData
);

// Lấy lịch sử điểm danh của user đang đăng nhập (SV)
router.get(
    '/history',
    authMiddleware.protect,
    roleMiddleware.restrictTo('student'),
    attendanceController.getAttendanceHistory
);

// Lấy điểm danh theo lớp và ngày (GV/Admin)
 router.get(
     '/class/:classId',
     authMiddleware.protect,
     roleMiddleware.restrictTo('teacher', 'admin'),
     attendanceController.getAttendanceByClassAndDate
 );

// Cập nhật trạng thái điểm danh (GV/Admin) - Giữ lại từ lần trước
router.put(
    '/:attendanceId/status',
    authMiddleware.protect,
    roleMiddleware.restrictTo('teacher', 'admin'),
    [ body('status').isIn(['present', 'absent', 'permitted_absence', 'manual', 'QR']).withMessage('Invalid status value') ],
    attendanceController.updateAttendanceStatus // Đảm bảo hàm này tồn tại trong controller
);
// Nếu tách riêng route cho QR code
// router.post('/qr', authMiddleware.protect, authMiddleware.restrictTo('teacher'), attendanceController.createQRCode);

module.exports = router;