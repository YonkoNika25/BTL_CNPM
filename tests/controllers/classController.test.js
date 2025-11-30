// tests/controllers/classController.test.js
const classController = require('../../src/controllers/classController');
const Class = require('../../src/models/Class');
const httpMocks = require('node-mocks-http');

jest.mock('../../src/models/Class');

let req, res;

beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
});

describe('Class Controller Tests', () => {

    // --- TEST: createClass ---
    describe('createClass', () => {
        beforeEach(() => {
            req.user = { id: 1 };
            req.body = { class_code: 'COMP101', class_name: 'Intro to IT' };
        });

        it('[SUCCESS] Tạo lớp thành công', async () => {
            const mockClass = { id: 1, ...req.body, teacher_id: 1 };
            Class.create.mockResolvedValue(mockClass);

            await classController.createClass(req, res);

            expect(res.statusCode).toBe(201);
            expect(res._getJSONData()).toEqual(mockClass);
        });
    });

    // --- TEST: getClassById ---
    describe('getClassById', () => {
        it('[SUCCESS] Lấy thông tin lớp thành công', async () => {
            req.params.id = 1;
            Class.findById.mockResolvedValue({ id: 1, class_name: 'Math' });

            await classController.getClassById(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData().class_name).toBe('Math');
        });

        it('[FAIL] Trả về 404 nếu không tìm thấy lớp', async () => {
            req.params.id = 999;
            Class.findById.mockResolvedValue(null);

            await classController.getClassById(req, res);

            expect(res.statusCode).toBe(404);
        });
    });

    // --- TEST: addStudentToClass ---
    describe('addStudentToClass', () => {
        beforeEach(() => {
            req.params = { classId: 1 };
            req.body = { userId: 50 };
        });

        it('[SUCCESS] Thêm sinh viên thành công', async () => {
            Class.addStudentToClass.mockResolvedValue({ success: true });
            await classController.addStudentToClass(req, res);
            expect(res.statusCode).toBe(201);
        });

        it('[FAIL] Trả về 400 nếu sinh viên đã có trong lớp', async () => {
            const error = new Error('Unique violation');
            error.code = '23505'; // Mã lỗi Postgres
            Class.addStudentToClass.mockRejectedValue(error);

            await classController.addStudentToClass(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData().message).toContain('Sinh viên đã có trong lớp');
        });
    });
});