// tests/controllers/notificationController.test.js
const notificationController = require('../../src/controllers/notificationController');
const Notification = require('../../src/models/Notification');
const httpMocks = require('node-mocks-http');

// Mock Notification model
jest.mock('../../src/models/Notification');

let req, res;

beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
});

describe('Notification Controller Tests', () => {

    // UNIT TEST: getUnreadNotifications 
    describe('getUnreadNotifications', () => {
        beforeEach(() => {
            req.user = { id: 1 }; // Giả lập user đã đăng nhập
            req.query = { limit: 10, offset: 0 };
        });

        it('[SUCCESS] Trả về danh sách thông báo chưa đọc', async () => {
            const mockData = [{ id: 1, message: 'Test Msg', is_read: false }];
            Notification.getUnreadNotifications.mockResolvedValue(mockData);

            await notificationController.getUnreadNotifications(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual(mockData);
            expect(Notification.getUnreadNotifications).toHaveBeenCalledWith(1, 10, 0);
        });

        it('[FAIL] Trả về 500 khi có lỗi server', async () => {
            Notification.getUnreadNotifications.mockRejectedValue(new Error('DB Error'));

            await notificationController.getUnreadNotifications(req, res);

            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({ message: 'Server error' });
        });
    });

    // UNIT TEST: markAsRead 
    describe('markAsRead', () => {
        beforeEach(() => {
            req.params = { id: 123 };
        });

        it('[SUCCESS] Đánh dấu đã đọc thành công', async () => {
            const mockNotification = { id: 123, is_read: true };
            Notification.markAsRead.mockResolvedValue(mockNotification);

            await notificationController.markAsRead(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual(mockNotification);
        });

        it('[FAIL] Trả về 404 nếu không tìm thấy thông báo', async () => {
            Notification.markAsRead.mockResolvedValue(null);

            await notificationController.markAsRead(req, res);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toEqual({ message: 'Notification not found' });
        });

        it('[FAIL] Trả về 500 khi có lỗi server', async () => {
            Notification.markAsRead.mockRejectedValue(new Error('DB Error'));
            await notificationController.markAsRead(req, res);
            expect(res.statusCode).toBe(500);
        });
    });

    // UNIT TEST: createNotification 
    describe('createNotification', () => {
        beforeEach(() => {
            req.body = { user_id: 2, message: 'Hello' };
        });

        it('[SUCCESS] Tạo thông báo thành công', async () => {
            const mockNewNoti = { id: 1, user_id: 2, message: 'Hello', is_read: false };
            Notification.create.mockResolvedValue(mockNewNoti);

            await notificationController.createNotification(req, res);

            expect(res.statusCode).toBe(201);
            expect(res._getJSONData()).toEqual(mockNewNoti);
        });

        it('[FAIL] Trả về 500 khi lỗi server', async () => {
            Notification.create.mockRejectedValue(new Error('DB Error'));
            await notificationController.createNotification(req, res);
            expect(res.statusCode).toBe(500);
        });
    });
});