// tests/controllers/attendanceController.test.js
const attendanceController = require('../../src/controllers/attendanceController');
const Attendance = require('../../src/models/Attendance');
const Class = require('../../src/models/Class');
const httpMocks = require('node-mocks-http');

jest.mock('../../src/models/Attendance');
jest.mock('../../src/models/Class');
// Mock validationResult của express-validator
jest.mock('express-validator', () => ({
    validationResult: jest.fn(() => ({ isEmpty: () => true })) // Mặc định không có lỗi validate
}));

let req, res;

beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
});

describe('Attendance Controller Tests', () => {

    // --- TEST: generateQRCodeData ---
    describe('generateQRCodeData', () => {
        beforeEach(() => {
            req.params = { classId: '101' };
            req.user = { id: 1, role: 'teacher' };
            req.body = { durationMinutes: 5 };
        });

        it('[SUCCESS] Tạo QR Data thành công', async () => {
            // Mock lớp học do giáo viên ID 1 dạy
            Class.findById.mockResolvedValue({ id: 101, teacher_id: 1 });

            await attendanceController.generateQRCodeData(req, res);

            expect(res.statusCode).toBe(201);
            const data = res._getJSONData();
            expect(data).toHaveProperty('qrData');
            expect(data).toHaveProperty('expiresAt');
        });

        it('[FAIL] Trả về 403 nếu giáo viên không dạy lớp này', async () => {
            Class.findById.mockResolvedValue({ id: 101, teacher_id: 999 }); // Teacher ID khác

            await attendanceController.generateQRCodeData(req, res);

            expect(res.statusCode).toBe(403);
            expect(res._getJSONData()).toEqual({ message: 'Forbidden: You do not teach this class.' });
        });
    });

    // --- TEST: createAttendance (Điểm danh QR) ---
    describe('createAttendance (QR)', () => {
        beforeEach(() => {
            req.body = {
                attendance_type: 'QR',
                qrData: JSON.stringify({ classId: '101', secret: 'secret123' })
            };
            req.user = { id: 50, role: 'student' };
            
            // Setup giả lập QR Store trong controller (cần trick nhỏ hoặc test integration, nhưng ở đây ta mock hành vi)
            // LƯU Ý: Vì biến `qrCodeStore` là biến local trong controller module, ta khó mock trực tiếp.
            // Tuy nhiên, ta có thể test các logic bên ngoài QR Store trước.
            // Để test full logic QR, ta cần chạy generateQRCodeData trước để set giá trị vào store.
        });

        it('[FAIL] Trả về 403 nếu user không phải student', async () => {
            req.user = { id: 1, role: 'teacher' };
            await attendanceController.createAttendance(req, res);
            expect(res.statusCode).toBe(403);
            expect(res._getJSONData().message).toContain('Only students');
        });

        it('[FAIL] Trả về 403 nếu sinh viên không thuộc lớp', async () => {
             // Mock sinh viên thuộc lớp khác
             Class.getClassesByStudentId.mockResolvedValue([{ id: 200 }]); 

             await attendanceController.createAttendance(req, res);

             expect(res.statusCode).toBe(403);
             expect(res._getJSONData().message).toContain('not enrolled');
        });

        // Test case này giả định logic QR Store hoạt động (hoặc ta bỏ qua phần check store bằng cách mock sâu hơn)
        // Đây là ví dụ test Manual Attendance (dễ test hơn)
    });

    // --- TEST: createAttendance (Manual) ---
    describe('createAttendance (Manual)', () => {
        beforeEach(() => {
            req.body = {
                attendance_type: 'manual',
                class_id: 101,
                userId: 50
            };
            req.user = { id: 1, role: 'teacher' };
        });

        it('[SUCCESS] Điểm danh thủ công thành công', async () => {
            Class.findById.mockResolvedValue({ id: 101, teacher_id: 1 });
            Attendance.getAttendanceByUserClassDate.mockResolvedValue([]); // Chưa điểm danh
            Attendance.create.mockResolvedValue({ id: 1, status: 'present' });

            await attendanceController.createAttendance(req, res);

            expect(res.statusCode).toBe(201);
            expect(Attendance.create).toHaveBeenCalled();
        });

        it('[FAIL] Trả về 409 nếu đã điểm danh hôm nay', async () => {
            Class.findById.mockResolvedValue({ id: 101, teacher_id: 1 });
            Attendance.getAttendanceByUserClassDate.mockResolvedValue([{ id: 5 }]); // Đã có record

            await attendanceController.createAttendance(req, res);

            expect(res.statusCode).toBe(409);
            expect(res._getJSONData().message).toContain('already recorded');
        });
    });

    // --- TEST: updateAttendanceStatus ---
    describe('updateAttendanceStatus', () => {
        beforeEach(() => {
            req.params = { attendanceId: 1 };
            req.body = { status: 'present' }; // type
            req.user = { id: 1, role: 'teacher' };
        });

        it('[SUCCESS] Cập nhật trạng thái thành công', async () => {
            // Mock bản ghi tồn tại
            Attendance.findById.mockResolvedValue({ id: 1, class_id: 101 });
            // Mock lớp học đúng của GV này
            Class.findById.mockResolvedValue({ id: 101, teacher_id: 1 });
            // Mock update thành công
            Attendance.update.mockResolvedValue({ id: 1, attendance_type: 'present' });

            await attendanceController.updateAttendanceStatus(req, res);

            expect(res.statusCode).toBe(200);
            expect(Attendance.update).toHaveBeenCalledWith(1, expect.objectContaining({ attendance_type: 'present' }));
        });

        it('[FAIL] Trả về 400 nếu status không hợp lệ', async () => {
            req.body.status = 'invalid_status';
            await attendanceController.updateAttendanceStatus(req, res);
            expect(res.statusCode).toBe(400);
        });
    });
});