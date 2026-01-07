// backend/tests/system_flow.test.js

const request = require('supertest');
const app = require('../src/app');

// Tạo dữ liệu ngẫu nhiên để tránh lỗi "User already exists" khi chạy test nhiều lần
const generateRandomId = () => Math.floor(Math.random() * 10000);
const uniqueSuffix = Date.now();

describe('HỆ THỐNG ĐIỂM DANH - SYSTEM TESTING FLOW', () => {
    // Biến lưu trữ dữ liệu giữa các bước test
    let teacherToken;
    let teacherId;
    let studentToken;
    let studentId;
    let classId;
    let qrStringData; // Chuỗi JSON QR code lấy từ API

    // Dữ liệu mẫu
    const teacherData = {
        username: `teacher_${uniqueSuffix}`,
        password: 'Password123!',
        email: `teacher_${uniqueSuffix}@school.edu`,
        full_name: 'Thay Giao Test',
        role: 'teacher'
    };

    const studentData = {
        username: `student_${uniqueSuffix}`,
        password: 'Password123!',
        email: `student_${uniqueSuffix}@school.edu`,
        full_name: 'Sinh Vien Test',
        student_id: `SV_${uniqueSuffix}`,
        role: 'student'
    };

    const classData = {
        class_code: `INT3306_${uniqueSuffix}`,
        class_name: 'Kiem Thu Phan Mem'
    };

    // --- BƯỚC 1: ĐĂNG KÝ TÀI KHOẢN ---

    test('Step 1.1: Đăng ký tài khoản Giảng viên', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(teacherData);
        
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.role).toEqual('teacher');
        
        teacherToken = res.body.token;
        teacherId = res.body.user.id;
    });

    test('Step 1.2: Đăng ký tài khoản Sinh viên', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(studentData);
        
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.role).toEqual('student');

        studentToken = res.body.token;
        studentId = res.body.user.id;
    });

    // --- BƯỚC 2: QUẢN LÝ LỚP HỌC ---

    test('Step 2.1: Giảng viên tạo lớp học', async () => {
        const res = await request(app)
            .post('/api/classes')
            .set('Authorization', `Bearer ${teacherToken}`) // Header xác thực
            .send(classData);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.class_code).toEqual(classData.class_code);

        classId = res.body.id; // Lưu ID lớp để dùng sau
    });

    test('Step 2.2: Thêm sinh viên vào lớp học', async () => {
        // Gọi API addStudentToClass (Dựa trên code classController: const { userId } = req.body)
        const res = await request(app)
            .post(`/api/classes/${classId}/students`)
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({ userId: studentId });

        // Có thể trả về 201 hoặc 200 tùy controller
        expect([200, 201]).toContain(res.statusCode); 
    });

    // --- BƯỚC 3: QUY TRÌNH ĐIỂM DANH QR (CORE FEATURE) ---

    test('Step 3.1: Giảng viên tạo mã QR cho lớp học', async () => {
        // Dựa trên attendanceController: router.post('/qr/generate/:classId')
        const res = await request(app)
            .post(`/api/attendance/qr/generate/${classId}`)
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({ durationMinutes: 10 });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('qrData');
        
        // qrData trả về là string JSON, ta cần giữ nguyên để gửi lại
        qrStringData = res.body.qrData; 
        console.log('Generated QR Data:', qrStringData);
    });

    test('Step 3.2: Sinh viên quét mã QR để điểm danh', async () => {
        // Dựa trên attendanceController: createAttendance
        // Body cần: { attendance_type: 'QR', qrData: ... }
        const res = await request(app)
            .post('/api/attendance')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                attendance_type: 'QR',
                qrData: qrStringData // Gửi chuỗi JSON nhận được từ bước trên
            });

        // Debug nếu lỗi
        if (res.statusCode !== 201) {
            console.log('Attendance Error:', res.body);
        }

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('attendance_type', 'QR');
        expect(res.body).toHaveProperty('user_id', studentId);
        expect(res.body).toHaveProperty('class_id', parseInt(classId));
    });

    test('Step 3.3: Ngăn chặn điểm danh trùng lặp (Anti-Duplicate)', async () => {
        // Sinh viên cố gắng quét lại mã QR cũ trong cùng ngày
        const res = await request(app)
            .post('/api/attendance')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                attendance_type: 'QR',
                qrData: qrStringData
            });

        // Controller trả về 409 Conflict
        expect(res.statusCode).toEqual(409);
        expect(res.body.message).toMatch(/already recorded/i);
    });

    // --- BƯỚC 4: KIỂM TRA DỮ LIỆU & BÁO CÁO ---

    test('Step 4.1: Sinh viên xem lịch sử điểm danh', async () => {
        const res = await request(app)
            .get('/api/attendance/history')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        // Kiểm tra phần tử đầu tiên có phải là lần điểm danh vừa rồi không
        expect(res.body[0].class_code).toEqual(classData.class_code);
        expect(res.body[0].attendance_type).toEqual('QR');
    });

    test('Step 4.2: Giảng viên xem danh sách điểm danh theo ngày', async () => {
        const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        
        const res = await request(app)
            .get(`/api/attendance/class/${classId}`)
            .query({ date: today }) // Query params
            .set('Authorization', `Bearer ${teacherToken}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        
        // Tìm xem sinh viên vừa điểm danh có trong danh sách không
        const studentRecord = res.body.find(r => r.user_id === studentId);
        expect(studentRecord).toBeDefined();
        expect(studentRecord.attendance_type).toEqual('QR');
    });

});
