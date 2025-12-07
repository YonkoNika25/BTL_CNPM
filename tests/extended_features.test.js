// backend/tests/extended_features.test.js

const request = require('supertest');
const app = require('../src/app');

// Hàm helper tạo ID ngẫu nhiên
const uniqueSuffix = Date.now();
const generateEmail = (role) => `${role}_${Math.floor(Math.random() * 10000)}_${uniqueSuffix}@test.com`;

describe('HỆ THỐNG ĐIỂM DANH - CÁC TÍNH NĂNG MỞ RỘNG & BẢO MẬT', () => {
    let teacherToken, teacherId;
    let studentToken, studentId;
    let classId;
    let attendanceId; // ID của bản ghi điểm danh để test sửa

    // --- SETUP: TẠO DỮ LIỆU NỀN TẢNG ---
    beforeAll(async () => {
        // 1. Tạo GV
        const resGV = await request(app).post('/api/auth/register').send({
            username: `gv_ext_${uniqueSuffix}`, password: 'Password123!',
            email: generateEmail('teacher'), full_name: 'GV Extension', role: 'teacher'
        });
        teacherToken = resGV.body.token;
        teacherId = resGV.body.user.id;

        // 2. Tạo SV
        const resSV = await request(app).post('/api/auth/register').send({
            username: `sv_ext_${uniqueSuffix}`, password: 'Password123!',
            email: generateEmail('student'), full_name: 'SV Extension', student_id: `SVEXT_${uniqueSuffix}`, role: 'student'
        });
        studentToken = resSV.body.token;
        studentId = resSV.body.user.id;

        // 3. GV Tạo lớp
        const resClass = await request(app).post('/api/classes').set('Authorization', `Bearer ${teacherToken}`).send({
            class_code: `EXT_${uniqueSuffix}`, class_name: 'Lop Mo Rong'
        });
        classId = resClass.body.id;

        // 4. Add SV vào lớp
        await request(app).post(`/api/classes/${classId}/students`).set('Authorization', `Bearer ${teacherToken}`).send({ userId: studentId });
    });

    // --- PHẦN 1: KIỂM THỬ BẢO MẬT & NGOẠI LỆ (NEGATIVE TESTING) ---

    test('AUTH_FAIL: Đăng nhập sai mật khẩu', async () => {
        const res = await request(app).post('/api/auth/login').send({
            username: `sv_ext_${uniqueSuffix}`,
            password: 'WRONG_PASSWORD'
        });
        expect(res.statusCode).toEqual(401); // SRS 3.5.1 Alt Flow
    });

    test('RBAC_FAIL: Sinh viên cố tình tạo lớp học (Quyền Teacher)', async () => {
        const res = await request(app)
            .post('/api/classes')
            .set('Authorization', `Bearer ${studentToken}`) // Token của SV
            .send({ class_code: 'HACK101', class_name: 'Hacker Class' });
        
        // Mong đợi lỗi 403 Forbidden
        expect(res.statusCode).toEqual(403);
    });

    test('ATT_FAIL: Điểm danh QR sai "Secret" hoặc dữ liệu rác', async () => {
        const fakeQRData = JSON.stringify({ classId: classId, secret: "FAKE_SECRET", t: Date.now() });
        
        const res = await request(app)
            .post('/api/attendance')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ attendance_type: 'QR', qrData: fakeQRData });

        expect(res.statusCode).toEqual(400); // Bad Request
        expect(res.body.message).toMatch(/Invalid QR/i);
    });

    // --- PHẦN 2: ĐIỂM DANH THỦ CÔNG & CHỈNH SỬA (SRS 3.2.3, 3.2.4) ---

    test('MANUAL_ATT: Giảng viên điểm danh thủ công cho sinh viên', async () => {
        // SRS 3.2.3: Giảng viên có thể điểm danh hộ
        const res = await request(app)
            .post('/api/attendance')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({
                attendance_type: 'manual',
                class_id: classId,
                userId: studentId // ID của sinh viên cần điểm danh
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.attendance_type).toEqual('manual');
        attendanceId = res.body.id; // Lưu lại ID để test sửa
    });

    test('UPDATE_ATT: Giảng viên sửa trạng thái điểm danh (Vắng -> Có mặt)', async () => {
        // SRS 3.5.8 (Mô phỏng việc GV duyệt yêu cầu sửa điểm danh)
        // Controller: exports.updateAttendanceStatus
        const res = await request(app)
            .put(`/api/attendance/${attendanceId}/status`) // Lưu ý route này cần check lại file router của bạn
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({ status: 'present' });

        // Nếu route chưa define đúng trong router, test này sẽ fail 404
        // Dựa trên code bạn gửi, router là: router.put('/:attendanceId/status', ...)
        expect(res.statusCode).toEqual(200);
        expect(res.body.attendance_type).toEqual('present');
    });

    // --- PHẦN 3: QUẢN LÝ TÀI KHOẢN (SRS 3.2.1) ---

    test('PROFILE_UPDATE: Sinh viên cập nhật Mã SV', async () => {
        const newStudentId = `NEW_ID_${uniqueSuffix}`;
        const res = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                full_name: 'SV Extension Updated',
                email: generateEmail('student_new'),
                student_id: newStudentId
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.student_id).toEqual(newStudentId);
    });

    test('PASS_CHANGE: Đổi mật khẩu thành công', async () => {
        const res = await request(app)
            .put('/api/auth/change-password')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                oldPassword: 'Password123!',
                newPassword: 'NewPassword456!'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toMatch(/success/i);

        // Thử đăng nhập lại bằng pass mới
        const loginRes = await request(app).post('/api/auth/login').send({
            username: `sv_ext_${uniqueSuffix}`,
            password: 'NewPassword456!'
        });
        expect(loginRes.statusCode).toEqual(200);
    });

    // --- PHẦN 4: THÔNG BÁO (SRS 3.2.6) ---
    // Lưu ý: Controller Notification có, nhưng Router chưa thấy route POST để tạo thông báo test.
    // Ta sẽ test việc lấy danh sách rỗng hoặc đánh dấu đã đọc.

    test('NOTI_GET: Lấy danh sách thông báo chưa đọc', async () => {
        const res = await request(app)
            .get('/api/notifications/unread')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });
});