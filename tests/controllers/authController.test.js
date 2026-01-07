// tests/controllers/authController.test.js

// 1. Import các module cần thiết
const authController = require('../../src/controllers/authController');
const User = require('../../src/models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const httpMocks = require('node-mocks-http');
const config = require('../../src/config');

// 2. Mock các dependencies 
jest.mock('../../src/models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../src/config', () => ({ jwtSecret: 'test_secret' }));

// Helper function để giả lập req, res
let req, res;
beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    // Reset các mock trước mỗi test case để đảm bảo sạch sẽ
    jest.clearAllMocks();
});

describe('Auth Controller Unit Tests', () => {

    
    // --- TEST: REGISTER ---
    
    describe('register', () => {
        beforeEach(() => {
            req.body = {
                username: 'testuser',
                password: 'password123',
                role: 'student',
                email: 'test@example.com',
                full_name: 'Test User'
            };
        });

        it('[SUCCESS] Đăng ký thành công trả về 201 và token', async () => {
            // Giả lập User.findByUsername trả về null (nghĩa là user chưa tồn tại)
            User.findByUsername.mockResolvedValue(null);
            // Giả lập hash password
            bcrypt.hash.mockResolvedValue('hashedPassword123');
            // Giả lập tạo user thành công
            const newUser = { id: 1, username: 'testuser', role: 'student', password: 'hashedPassword123' };
            User.create.mockResolvedValue(newUser);
            
            // Giả lập jwt.sign (xử lý cho promisify)
            // Vì code dùng promisify(jwt.sign), ta cần mock implementation kiểu callback
            jwt.sign.mockImplementation((payload, secret, options, callback) => {
                callback(null, 'mockToken123');
            });

            await authController.register(req, res);

            expect(res.statusCode).toBe(201);
            expect(res._getJSONData()).toEqual({
                message: 'Đăng ký thành công',
                token: 'mockToken123',
                user: { id: 1, username: 'testuser', role: 'student' }
            });
            // Kiểm tra xem các hàm có được gọi đúng không
            expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
                username: 'testuser',
                password: 'hashedPassword123'
            }));
        });

        it('[FAIL] Trả về 400 nếu Username đã tồn tại', async () => {
            // Giả lập tìm thấy user
            User.findByUsername.mockResolvedValue({ id: 99, username: 'testuser' });

            await authController.register(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ message: 'Username đã tồn tại.' });
            // Đảm bảo không gọi lệnh tạo user
            expect(User.create).not.toHaveBeenCalled();
        });

        it('[FAIL] Trả về 500 nếu Database gặp lỗi khi tạo User', async () => {
            User.findByUsername.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedpass');
            // Giả lập lỗi DB
            User.create.mockRejectedValue(new Error('DB Connection Error'));

            await authController.register(req, res);

            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({ message: 'Lỗi server' });
        });
    });

    
    // --- TEST: LOGIN ---
    
    describe('login', () => {
        beforeEach(() => {
            req.body = { username: 'testuser', password: 'password123' };
        });

        it('[SUCCESS] Đăng nhập thành công trả về token', async () => {
            const mockUser = { id: 1, username: 'testuser', password: 'hashedPassword', role: 'student' };
            User.findByUsername.mockResolvedValue(mockUser);
            // Giả lập mật khẩu khớp
            bcrypt.compare.mockResolvedValue(true);
            // Giả lập JWT trả về string (vì hàm login của bạn dùng await jwt.sign trực tiếp)
            jwt.sign.mockImplementation(() => 'mockTokenLogin');

            await authController.login(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                message: 'Đăng nhập thành công',
                token: 'mockTokenLogin',
                user: { id: 1, username: 'testuser', role: 'student' }
            });
        });

        it('[FAIL] Trả về 400 nếu thiếu username hoặc password', async () => {
            req.body = { username: '' }; // Thiếu password
            await authController.login(req, res);
            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
        });

        it('[FAIL] Trả về 401 nếu User không tồn tại', async () => {
            User.findByUsername.mockResolvedValue(null);
            await authController.login(req, res);
            expect(res.statusCode).toBe(401);
            expect(res._getJSONData()).toEqual({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
        });

        it('[FAIL] Trả về 401 nếu sai mật khẩu', async () => {
            const mockUser = { id: 1, username: 'testuser', password: 'hashedPassword' };
            User.findByUsername.mockResolvedValue(mockUser);
            // Giả lập mật khẩu KHÔNG khớp
            bcrypt.compare.mockResolvedValue(false);

            await authController.login(req, res);

            expect(res.statusCode).toBe(401);
            expect(res._getJSONData()).toEqual({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
        });

        it('[FAIL] Trả về 500 nếu có lỗi bất ngờ từ Server', async () => {
            // Giả lập lỗi ngay từ bước tìm user
            User.findByUsername.mockRejectedValue(new Error('Unexpected Error'));
            await authController.login(req, res);
            expect(res.statusCode).toBe(500);
        });
    });

    
    // --- TEST: UPDATE PROFILE ---
    
    describe('updateProfile', () => {
        beforeEach(() => {
            // Giả lập dữ liệu user đã được middleware xác thực gắn vào req
            req.user = { id: 1, role: 'student' }; 
            req.body = { full_name: 'New Name', email: 'new@example.com', student_id: 'SV001' };
        });

        it('[SUCCESS] Cập nhật thành công thông tin user', async () => {
            const updatedUser = { id: 1, full_name: 'New Name', email: 'new@example.com', role: 'student', password: 'hash' };
            User.update.mockResolvedValue(updatedUser);

            await authController.updateProfile(req, res);

            expect(User.update).toHaveBeenCalledWith(1, { full_name: 'New Name', email: 'new@example.com', student_id: 'SV001' });
            expect(res.statusCode).toBe(200);
            // Kiểm tra password đã bị loại bỏ
            expect(res._getJSONData()).not.toHaveProperty('password');
            expect(res._getJSONData().full_name).toBe('New Name');
        });

        it('[FAIL] Trả về 404 nếu User không tìm thấy (lúc update)', async () => {
            User.update.mockResolvedValue(null);
            await authController.updateProfile(req, res);
            expect(res.statusCode).toBe(404);
        });

        it('[FAIL] Trả về 400 nếu Email đã tồn tại (Lỗi ràng buộc DB)', async () => {
            // Giả lập lỗi DB cụ thể (Postgres error code 23505)
            const error = new Error('Unique constraint');
            error.code = '23505';
            error.constraint = 'users_email_key';
            User.update.mockRejectedValue(error);

            await authController.updateProfile(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ message: 'Email already exists' });
        });

        it('[FAIL] Trả về 400 nếu Student ID đã tồn tại', async () => {
            const error = new Error('Unique constraint');
            error.code = '23505';
            error.constraint = 'users_student_id_key';
            User.update.mockRejectedValue(error);

            await authController.updateProfile(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ message: 'Student ID already exists' });
        });
    });

    
    // --- TEST: CHANGE PASSWORD ---
    
    describe('changePassword', () => {
        beforeEach(() => {
            req.user = { id: 1 };
            req.body = { oldPassword: 'oldPass', newPassword: 'newPass' };
        });

        it('[SUCCESS] Đổi mật khẩu thành công', async () => {
            User.changePassword.mockResolvedValue(true);
            await authController.changePassword(req, res);
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({ message: 'Password changed successfully' });
        });

        it('[FAIL] Trả về 400 nếu thiếu mật khẩu cũ hoặc mới', async () => {
            req.body = { oldPassword: '' };
            await authController.changePassword(req, res);
            expect(res.statusCode).toBe(400);
            expect(res._getJSONData().message).toContain('required');
        });

        it('[FAIL] Trả về 400 nếu mật khẩu cũ không đúng (Model throw error)', async () => {
            // Giả lập Model ném lỗi 'Incorrect password'
            User.changePassword.mockRejectedValue(new Error('Incorrect password'));
            
            await authController.changePassword(req, res);
            
            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ message: 'Incorrect old password.' });
        });

        it('[FAIL] Trả về 404 nếu User không tồn tại', async () => {
            User.changePassword.mockRejectedValue(new Error('User not found'));
            
            await authController.changePassword(req, res);
            
            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toEqual({ message: 'User not found.' });
        });
    });

});
