// backend/src/controllers/attendanceController.js

const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const { generateRandomCode } = require('../utils/helpers');
const { validationResult } = require('express-validator');

const qrCodeStore = {}

exports.generateQRCodeData = async (req, res) => {
    try {
        const { classId } = req.params;
        const teacherId = req.user.id; // User đang đăng nhập phải là GV
        const { durationMinutes = 5 } = req.body; // Mặc định 5 phút

        // Kiểm tra quyền GV
        const classInfo = await Class.findById(classId);
        if (!classInfo || classInfo.teacher_id !== teacherId) {
            // Admin có được tạo QR không? Nếu có thì thêm check: req.user.role !== 'admin'
            return res.status(403).json({ message: 'Forbidden: You do not teach this class.' });
        }

        // Tạo secret và thời gian hết hạn
        const secret = generateRandomCode(16);
        const now = new Date();
        const expiresAt = new Date(now.getTime() + durationMinutes * 60000);

        // Lưu trữ (ghi đè nếu có)
        qrCodeStore[classId] = { secret, expiresAt: expiresAt.getTime() };
        console.log(`[QR Store Update] Class ${classId}: Secret set, expires at ${expiresAt.toISOString()}`);

        // Dữ liệu để tạo QR ở frontend
        const qrDataPayload = {
            classId: classId.toString(), // Đảm bảo là string
            secret: secret,
            t: now.getTime(), // Timestamp tạo (để tránh trùng lặp nếu cần)
        };

        res.status(201).json({
            qrData: JSON.stringify(qrDataPayload), // Chuỗi JSON để frontend tạo QR
            expiresAt: expiresAt.toISOString(),
        });

    } catch (error) {
        console.error('[QR Generate Error]', error);
        res.status(500).json({ message: 'Server error generating QR data' });
    }
};

exports.createAttendance = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { attendance_type, class_id, userId: manualUserId, qrData } = req.body;
        const currentUser = req.user; // User thực hiện request

        let user_id_to_record;
        let class_id_to_record;
        let recordTimestamp = new Date(); // Mặc định là bây giờ

        if (attendance_type === 'manual') {
            // --- Xử lý điểm danh thủ công ---
            if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
                return res.status(403).json({ message: 'Forbidden: Manual attendance requires Teacher or Admin role.' });
            }
            if (!manualUserId || !class_id) {
                return res.status(400).json({ message: 'Class ID and User ID are required for manual attendance.' });
            }
            // Kiểm tra quyền của GV (Admin thì bỏ qua)
            if (currentUser.role === 'teacher') {
                const classInfo = await Class.findById(class_id);
                if (!classInfo || classInfo.teacher_id !== currentUser.id) {
                    return res.status(403).json({ message: 'Forbidden: You do not teach this class.' });
                }
            }
            user_id_to_record = manualUserId;
            class_id_to_record = class_id;
            // Có thể cho phép GV đặt timestamp khác nếu cần (lấy từ body)
            // recordTimestamp = req.body.timestamp ? new Date(req.body.timestamp) : new Date();

        } else if (attendance_type === 'QR') {
            // --- Xử lý điểm danh QR ---
            if (!currentUser || currentUser.role !== 'student') {
                return res.status(403).json({ message: 'Forbidden: Only students can check in via QR.' });
            }
            if (!qrData) {
                return res.status(400).json({ message: 'QR data is required.' });
            }

            let parsedQrData;
            try {
                parsedQrData = JSON.parse(qrData);
            } catch (e) {
                return res.status(400).json({ message: 'Invalid QR data format.' });
            }

            const { classId: qrClassId, secret: qrSecret } = parsedQrData;
            if (!qrClassId || !qrSecret) {
                 return res.status(400).json({ message: 'Invalid QR data content.' });
            }

            class_id_to_record = parseInt(qrClassId, 10); // Đảm bảo là số
            user_id_to_record = currentUser.id;

            // Kiểm tra xem sinh viên có thuộc lớp học này không
            const studentClasses = await Class.getClassesByStudentId(user_id_to_record);
            const isStudentInClass = studentClasses.some(c => c.id === class_id_to_record);
            if (!isStudentInClass) {
                console.log(`[QR Denied] User ${user_id_to_record} not in class ${class_id_to_record}.`);
                return res.status(403).json({ message: 'You are not enrolled in this class.' });
            }

            // Kiểm tra secret và thời hạn
            const storedQrInfo = qrCodeStore[class_id_to_record];
             console.log(`[QR Check] Class ${class_id_to_record} Store:`, storedQrInfo);

            if (!storedQrInfo) {
                return res.status(400).json({ message: 'Invalid QR code (no active session).' });
            }

            const now = Date.now();
            if (now > storedQrInfo.expiresAt) {
                console.log(`[QR Expired] Class ${class_id_to_record}. ExpiresAt: ${new Date(storedQrInfo.expiresAt).toISOString()}, Now: ${new Date(now).toISOString()}`);
                delete qrCodeStore[class_id_to_record]; // Xóa khi hết hạn
                return res.status(400).json({ message: 'QR code has expired.' });
            }

            if (storedQrInfo.secret !== qrSecret) {
                console.log(`[QR Secret Mismatch] Class ${class_id_to_record}. Expected: ${storedQrInfo.secret}, Received: ${qrSecret}`);
                return res.status(400).json({ message: 'Invalid QR code.' });
            }
             console.log(`[QR Valid] User ${user_id_to_record}, Class ${class_id_to_record}.`);
            // (Optionnel) Xóa QR sau khi dùng thành công?
            // delete qrCodeStore[class_id_to_record];

        } else {
            return res.status(400).json({ message: `Attendance type '${attendance_type}' is not supported.` });
        }

        // --- Kiểm tra điểm danh trùng trong ngày ---
        const today = recordTimestamp.toISOString().split('T')[0];
        const existingAttendance = await Attendance.getAttendanceByUserClassDate(user_id_to_record, class_id_to_record, today);
        if (existingAttendance && existingAttendance.length > 0) {
            console.log(`[Attendance Exists] User ${user_id_to_record}, Class ${class_id_to_record}, Date ${today}`);
             // Trả về bản ghi đã có thay vì lỗi? Hoặc lỗi 409? -> Trả lỗi 409
            return res.status(409).json({ message: 'Attendance already recorded for this class today.' });
        }

        // --- Tạo bản ghi điểm danh ---
        const attendanceData = {
            user_id: user_id_to_record,
            class_id: class_id_to_record,
            attendance_type: attendance_type, // 'manual' hoặc 'QR'
            timestamp: recordTimestamp,
        };
        const newAttendance = await Attendance.create(attendanceData);
        console.log(`[Attendance Recorded] User ${user_id_to_record}, Class ${class_id_to_record}, Type ${attendance_type}`);
        res.status(201).json(newAttendance);

    } catch (error) {
        console.error('[Create Attendance Error]', error);
        if (error.code === '23503') { // Lỗi foreign key
            return res.status(400).json({ message: 'Invalid user or class ID.' });
        }
        res.status(500).json({ message: 'Server error creating attendance record' });
    }
};

// --- API Lấy lịch sử điểm danh của user đang đăng nhập (SV) ---
exports.getAttendanceHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit, offset } = req.query;
        const history = await Attendance.getHistoryByUserId(userId, limit, offset);
        res.json(history);
    } catch (error) {
        console.error('[Get Attendance History Error]', error);
        res.status(500).json({ message: 'Server error fetching attendance history' });
    }
};

// --- API Cập nhật trạng thái điểm danh (GV/Admin) ---
exports.updateAttendanceStatus = async (req, res) => {
    try {
        const { attendanceId } = req.params;
        const { status /*, reason */ } = req.body; // status mới: 'present', 'absent', 'permitted_absence'
        const editorUserId = req.user.id;
        const editorRole = req.user.role;

        // Validate status
        const validStatuses = ['present', 'absent', 'permitted_absence', 'manual', 'QR']; // Thêm manual/QR nếu muốn giữ nguyên type gốc khi edit thành present
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const attendanceRecord = await Attendance.findById(attendanceId);
        if (!attendanceRecord) {
            return res.status(404).json({ message: 'Attendance record not found.' });
        }

        // Kiểm tra quyền: Admin hoặc GV dạy lớp đó
        if (editorRole !== 'admin') {
            const classInfo = await Class.findById(attendanceRecord.class_id);
            if (!classInfo || classInfo.teacher_id !== editorUserId) {
                return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this record.' });
            }
        }

        // Cập nhật chỉ attendance_type (hoặc cột status nếu có)
        const updateData = {
            attendance_type: status,
            // Thêm reason nếu có cột reason: reason: reason || null
        };

        // Sử dụng hàm update đã có hoặc hàm updateStatus nếu tạo riêng
        const updatedRecord = await Attendance.update(attendanceId, updateData);
        res.json(updatedRecord);

    } catch (error) {
        console.error('[Update Attendance Status Error]', error);
        res.status(500).json({ message: 'Server error updating attendance status' });
    }
};

// --- API Lấy điểm danh theo lớp và ngày (GV/Admin) ---
exports.getAttendanceByClassAndDate = async (req, res) => {
    try {
        const { classId } = req.params;
        const { date, limit, offset } = req.query;

        if (!date) {
            return res.status(400).json({ message: 'Date query parameter is required (YYYY-MM-DD).' });
        }
        // TODO: Validate date format

        // Kiểm tra quyền
        if (req.user.role !== 'admin') {
            const classInfo = await Class.findById(classId);
            // Chỉ GV dạy lớp mới được xem
            if (!classInfo || classInfo.teacher_id !== req.user.id) {
                return res.status(403).json({ message: 'Forbidden: You do not teach this class.' });
            }
        }

        const attendance = await Attendance.getAttendanceByClassAndDate(classId, date, limit, offset);
        res.json(attendance);

    } catch (error) {
        console.error('[Get Daily Attendance Error]', error);
        res.status(500).json({ message: 'Server error fetching daily attendance' });
    }
};


exports.getAttendanceByUserAndClass = async (req, res) => {
    try {
        const { userId } = req.params;
        const { classId, limit, offset } = req.query;

        // Kiểm tra xem người dùng hiện tại có quyền xem thông tin của userId này không
        if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const attendance = await Attendance.getAttendanceByUserAndClass(userId, classId, limit, offset);
        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"})
    }
};
exports.getAttendanceSummaryByClass = async(req, res) =>{
    try{
        const {classId} = req.params;
        const {startDate, endDate} = req.query;

        //Validate startDate và endDate

        const summary = await Attendance.getAttendanceSummaryByClass(classId, startDate, endDate);
        res.json(summary);
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"})
    }
}

// Thêm các hàm khác (createQRCode, verifyQRCode, ...)