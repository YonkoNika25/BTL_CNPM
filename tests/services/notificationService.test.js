// tests/services/notificationService.test.js

// 1. Mock file JSON service account (QUAN TRỌNG: Để tránh lỗi "Cannot find module")
// Đường dẫn phải khớp chính xác với require trong code của bạn (tính từ file test)
// Vì file test nằm ở tests/services, nên đường dẫn ../../../your-service-account-key.json trỏ ra root
jest.mock('../../../your-service-account-key.json', () => ({
    type: "service_account",
    project_id: "test-project"
}), { virtual: true });


// 2. Mock Database pool
const pool = require('../../src/config/db');
jest.mock('../../src/config/db', () => ({
    query: jest.fn()
}));

// 3. Mock firebase-admin
const admin = require('firebase-admin');

const mockSend = jest.fn(); 

jest.mock('firebase-admin', () => ({
    initializeApp: jest.fn(),
    credential: {
        cert: jest.fn()
    },
    messaging: () => ({
        send: mockSend
    })
}));

// Import service SAU KHI đã mock
const notificationService = require('../../src/services/notificationService');

describe('Notification Service Tests', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- TEST: sendNotification ---
    describe('sendNotification', () => {
        it('[SUCCESS] Gửi thông báo thành công', async () => {
            const mockResponse = { name: 'projects/messages/1' };
            mockSend.mockResolvedValue(mockResponse);

            const result = await notificationService.sendNotification(
                'token_123', 
                'Hello', 
                'World', 
                { classId: '1' }
            );

            expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
                token: 'token_123',
                notification: { title: 'Hello', body: 'World' },
                data: { classId: '1' }
            }));
            expect(result).toEqual(mockResponse);
        });

        it('[FAIL] Ném lỗi khi Firebase gặp sự cố', async () => {
            const error = new Error('Firebase Error');
            mockSend.mockRejectedValue(error);

            await expect(notificationService.sendNotification('token', 'T', 'B', {}))
                .rejects.toThrow('Firebase Error');
        });
    });

    // --- TEST: saveRegistrationToken ---
    describe('saveRegistrationToken', () => {
        it('[SUCCESS] Lưu token vào DB thành công', async () => {
            pool.query.mockResolvedValue({ rowCount: 1 });

            await notificationService.saveRegistrationToken(1, 'new_fcm_token');

            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE users SET fcm_token = $1 WHERE id = $2',
                ['new_fcm_token', 1]
            );
        });

        it('[FAIL] Ném lỗi khi DB gặp sự cố', async () => {
            const error = new Error('DB Error');
            pool.query.mockRejectedValue(error);

            await expect(notificationService.saveRegistrationToken(1, 'token'))
                .rejects.toThrow('DB Error');
        });
    });
});