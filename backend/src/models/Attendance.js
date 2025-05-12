// src/backend/src/models/Attendance.js
const pool = require('../config/db');

class Attendance {
    static async findById(id) {
        try {
            const result = await pool.query('SELECT * FROM attendance WHERE id = $1', [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error in Attendance.findById:', error);
            throw error;
        }
    }

    static async create(attendanceData) {
        try {
            const { user_id, class_id, attendance_type, timestamp, quiz_answer_id } = attendanceData;
            // Đảm bảo timestamp là đối tượng Date hợp lệ hoặc null/undefined
            const validTimestamp = timestamp instanceof Date ? timestamp : new Date();
            const result = await pool.query(
                'INSERT INTO attendance (user_id, class_id, attendance_type, timestamp, quiz_answer_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [user_id, class_id, attendance_type, validTimestamp, quiz_answer_id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error in Attendance.create:', error);
            throw error;
        }
    }

    // Hàm update tổng quát, có thể dùng để sửa status (attendance_type)
    static async update(id, attendanceData) {
        try{
            // Chỉ lấy các trường có thể cập nhật
            const { attendance_type, timestamp, quiz_answer_id /*, reason nếu có cột reason */ } = attendanceData;
            const fieldsToUpdate = [];
            const values = [];
            let paramIndex = 1;

            if (attendance_type !== undefined) {
                fieldsToUpdate.push(`attendance_type = $${paramIndex++}`);
                values.push(attendance_type);
            }
            if (timestamp !== undefined) {
                fieldsToUpdate.push(`timestamp = $${paramIndex++}`);
                values.push(timestamp);
            }
             if (quiz_answer_id !== undefined) {
                fieldsToUpdate.push(`quiz_answer_id = $${paramIndex++}`);
                values.push(quiz_answer_id);
            }
            // Thêm các trường khác nếu cần cập nhật (ví dụ: reason)

            if (fieldsToUpdate.length === 0) {
                // Nếu không có gì để update, trả về bản ghi hiện tại hoặc lỗi
                return this.findById(id);
            }

            values.push(id); // Thêm id vào cuối cho điều kiện WHERE

            const query = `
                UPDATE attendance
                SET ${fieldsToUpdate.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING *
            `;

            const result = await pool.query(query, values);
            return result.rows[0];
        }
        catch(error) {
            console.error("Error in Attendance.update", error);
            throw error;
        }
    }

    static async delete(id) {
       try{
           const result = await pool.query('DELETE FROM attendance WHERE id = $1 RETURNING *', [id]);
           return result.rows[0];
       }
       catch(error) {
           console.error("Error in Attendance.delete", error);
           throw error;
       }
    }

    static async getAttendanceByClassAndDate(classId, date, limit = 1000, offset = 0) { // Tăng limit mặc định
        try {
            const result = await pool.query(
                `SELECT a.*, u.username, u.full_name
                FROM attendance a
                INNER JOIN users u ON a.user_id = u.id
                WHERE a.class_id = $1 AND DATE(a.timestamp) = $2 AND u.is_deleted = FALSE
                ORDER BY u.full_name
                LIMIT $3 OFFSET $4`,
                [classId, date, limit, offset]
            );
            return result.rows;
        } catch (error) {
            console.error('Error in Attendance.getAttendanceByClassAndDate:', error);
            throw error;
        }
    }

    static async getAttendanceByUserAndClass(userId, classId, limit = 1000, offset = 0) {
       try {
           let query = `
               SELECT a.*, c.class_name, c.class_code
               FROM attendance a
               INNER JOIN classes c ON a.class_id = c.id
               WHERE a.user_id = $1`;
           const params = [userId];
           let paramIndex = 2;

           if (classId) {
               query += ` AND a.class_id = $${paramIndex++}`;
               params.push(classId);
           }
           query += ` ORDER BY a.timestamp DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
           params.push(limit, offset);

           const result = await pool.query(query, params);
           return result.rows;
       } catch (error) {
           console.error('Error in Attendance.getAttendanceByUserAndClass:', error);
           throw error;
       }
   }

    // --- HÀM MỚI: Lấy lịch sử của user, join với tên lớp ---
    static async getHistoryByUserId(userId, limit = 100, offset = 0) {
        try {
            const result = await pool.query(
                `SELECT a.id, a.user_id, a.class_id, a.attendance_type, a.timestamp,
                        c.class_name, c.class_code
                 FROM attendance a
                 INNER JOIN classes c ON a.class_id = c.id
                 WHERE a.user_id = $1
                 ORDER BY a.timestamp DESC
                 LIMIT $2 OFFSET $3`,
                [userId, limit, offset]
            );
            return result.rows;
        } catch (error) {
            console.error('Error in Attendance.getHistoryByUserId:', error);
            throw error;
        }
    }

    // --- HÀM MỚI: Kiểm tra điểm danh trong ngày ---
    static async getAttendanceByUserClassDate(userId, classId, date) {
        try {
            // date format YYYY-MM-DD
            const result = await pool.query(
                `SELECT * FROM attendance
                 WHERE user_id = $1 AND class_id = $2 AND DATE(timestamp) = $3`,
                [userId, classId, date]
            );
            return result.rows; // Trả về mảng, có thể rỗng hoặc có 1 phần tử
        } catch (error) {
            console.error('Error in Attendance.getAttendanceByUserClassDate:', error);
            throw error;
        }
    }
}

module.exports = Attendance;