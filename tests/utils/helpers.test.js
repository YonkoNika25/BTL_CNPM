// tests/utils/helpers.test.js
const helpers = require('../../src/utils/helpers');

describe('Helpers Unit Tests', () => {

    // --- TEST: formatDate ---
    describe('formatDate', () => {
        it('Nên format ngày thành chuỗi YYYY-MM-DD', () => {
            // Tạo một ngày cố định (Lưu ý: ISOString dùng giờ UTC)
            const date = new Date('2023-10-15T10:00:00Z'); 
            const result = helpers.formatDate(date);
            expect(result).toBe('2023-10-15');
        });

        it('Nên xử lý đúng với ngày khác', () => {
            const date = new Date('2024-01-01T00:00:00Z');
            expect(helpers.formatDate(date)).toBe('2024-01-01');
        });
    });

    // --- TEST: generateRandomCode ---
    describe('generateRandomCode', () => {
        it('Nên tạo chuỗi có độ dài đúng yêu cầu', () => {
            const length = 10;
            const code = helpers.generateRandomCode(length);
            expect(code).toHaveLength(length);
            expect(typeof code).toBe('string');
        });

        it('Nên chỉ chứa các ký tự cho phép (A-Z, a-z, 0-9)', () => {
            const code = helpers.generateRandomCode(100); // Tạo chuỗi dài để test xác suất
            const allowedChars = /^[A-Za-z0-9]+$/;
            expect(code).toMatch(allowedChars);
        });

        it('Nên tạo ra các mã khác nhau (tính ngẫu nhiên)', () => {
            const code1 = helpers.generateRandomCode(10);
            const code2 = helpers.generateRandomCode(10);
            expect(code1).not.toBe(code2);
        });
    });
});