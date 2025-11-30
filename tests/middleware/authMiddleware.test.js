// tests/middleware/authMiddleware.test.js
const authMiddleware = require('../../src/middleware/authMiddleware');
const User = require('../../src/models/User');
const jwt = require('jsonwebtoken');
const httpMocks = require('node-mocks-http');
const config = require('../../src/config');

// Mock dependencies
jest.mock('../../src/models/User');
jest.mock('jsonwebtoken');
jest.mock('../../src/config', () => ({ jwtSecret: 'test_secret' }));

let req, res, next;

beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn(); // Mock hàm next()
    jest.clearAllMocks();
});

describe('Auth Middleware Tests', () => {

    it('[FAIL] Trả về 401 nếu không có token trong header', async () => {
        req.headers.authorization = ''; // Không có header

        await authMiddleware.protect(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res._getJSONData()).toEqual({ message: 'Bạn chưa đăng nhập.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('[FAIL] Trả về 401 nếu token không hợp lệ (verify lỗi)', async () => {
        req.headers.authorization = 'Bearer invalid_token';
        // Giả lập verify ném lỗi
        jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

        await authMiddleware.protect(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res._getJSONData()).toEqual({ message: 'Token không hợp lệ.' });
    });

    it('[FAIL] Trả về 401 nếu token hết hạn', async () => {
        req.headers.authorization = 'Bearer expired_token';
        const error = new Error('TokenExpiredError');
        error.name = 'TokenExpiredError';
        jwt.verify.mockImplementation(() => { throw error; });

        await authMiddleware.protect(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res._getJSONData()).toEqual({ message: 'Token đã hết hạn.' });
    });

    it('[FAIL] Trả về 404 nếu token đúng nhưng không tìm thấy user trong DB', async () => {
        req.headers.authorization = 'Bearer valid_token';
        jwt.verify.mockReturnValue({ id: 999 }); // Token giải mã ra ID 999
        User.findById.mockResolvedValue(null); // DB không tìm thấy ID 999

        await authMiddleware.protect(req, res, next);

        expect(res.statusCode).toBe(404);
        expect(res._getJSONData()).toEqual({ message: 'Không tìm thấy người dùng.' });
    });

    it('[SUCCESS] Cho phép đi tiếp (next) nếu token và user hợp lệ', async () => {
        req.headers.authorization = 'Bearer valid_token';
        const mockUser = { id: 1, username: 'test' };
        
        jwt.verify.mockReturnValue({ id: 1 });
        User.findById.mockResolvedValue(mockUser);

        await authMiddleware.protect(req, res, next);

        // Kiểm tra xem user đã được gắn vào req chưa
        expect(req.user).toEqual(mockUser);
        // Kiểm tra hàm next() đã được gọi chưa
        expect(next).toHaveBeenCalled();
        // Đảm bảo không trả về response lỗi nào
        expect(res.statusCode).toBe(200); // Mặc định là 200 của mock
    });
});