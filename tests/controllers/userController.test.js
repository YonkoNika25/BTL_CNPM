// tests/controllers/userController.test.js
const userController = require('../../src/controllers/userController');
const User = require('../../src/models/User');
const bcrypt = require('bcrypt');
const httpMocks = require('node-mocks-http');

jest.mock('../../src/models/User');
jest.mock('bcrypt');

let req, res;

beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
});

describe('User Controller Tests', () => {

    // --- TEST: createUser ---
    describe('createUser', () => {
        beforeEach(() => {
            req.body = {
                username: 'newuser',
                password: 'password123',
                email: 'new@example.com',
                role: 'student'
            };
        });

        it('[SUCCESS] Tạo user thành công', async () => {
            User.findByUsername.mockResolvedValue(null);
            User.findByEmail.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedPass');
            
            const mockUser = { id: 1, username: 'newuser', role: 'student', password: 'hashedPass' };
            User.create.mockResolvedValue(mockUser);

            await userController.createUser(req, res);

            expect(res.statusCode).toBe(201);
            // Kiểm tra password không được trả về
            expect(res._getJSONData()).not.toHaveProperty('password');
            expect(res._getJSONData().username).toBe('newuser');
        });

        it('[FAIL] Trả về 400 nếu Username đã tồn tại', async () => {
            User.findByUsername.mockResolvedValue({ id: 1 }); // Đã tồn tại
            await userController.createUser(req, res);
            expect(res.statusCode).toBe(400);
            expect(res._getJSONData().message).toBe('Username already exists');
        });

        it('[FAIL] Trả về 400 nếu Email đã tồn tại', async () => {
            User.findByUsername.mockResolvedValue(null);
            User.findByEmail.mockResolvedValue({ id: 1 }); // Email tồn tại
            await userController.createUser(req, res);
            expect(res.statusCode).toBe(400);
            expect(res._getJSONData().message).toBe('Email already exists');
        });
    });

    // --- TEST: getUserById ---
    describe('getUserById', () => {
        it('[SUCCESS] Lấy user thành công', async () => {
            req.params.id = 1;
            const mockUser = { id: 1, username: 'test', password: 'secretpassword' };
            User.findById.mockResolvedValue(mockUser);

            await userController.getUserById(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).not.toHaveProperty('password');
        });

        it('[FAIL] Trả về 404 nếu không tìm thấy user', async () => {
            req.params.id = 999;
            User.findById.mockResolvedValue(null);
            await userController.getUserById(req, res);
            expect(res.statusCode).toBe(404);
        });
    });

    // --- TEST: deleteUser ---
    describe('deleteUser', () => {
        it('[SUCCESS] Xóa user thành công', async () => {
            req.params.id = 1;
            User.delete.mockResolvedValue(true); // Return true/object nếu xóa thành công

            await userController.deleteUser(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData().message).toContain('deleted successfully');
        });

        it('[FAIL] Trả về 404 nếu user không tồn tại', async () => {
            req.params.id = 999;
            User.delete.mockResolvedValue(null);
            await userController.deleteUser(req, res);
            expect(res.statusCode).toBe(404);
        });
    });
});