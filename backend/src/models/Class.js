// backend/src/models/Class.js
const pool = require('../config/db');

class Class {
    static async findById(id) {
        try {
            const result = await pool.query('SELECT * FROM classes WHERE id = $1', [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error in Class.findById:', error);
            throw error;
        }
    }

    static async create(classData) {
        try {
            const { class_code, class_name, teacher_id } = classData;
            const result = await pool.query(
                'INSERT INTO classes (class_code, class_name, teacher_id) VALUES ($1, $2, $3) RETURNING *',
                [class_code, class_name, teacher_id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error in Class.create:', error);
            throw error;
        }
    }

    static async update(id, classData) {
        try {
            const { class_code, class_name, teacher_id } = classData;
            const result = await pool.query(
                'UPDATE classes SET class_code = $1, class_name = $2, teacher_id = $3 WHERE id = $4 RETURNING *',
                [class_code, class_name, teacher_id, id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error in Class.update:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            // Xóa các bản ghi liên quan trong class_students và attendance trước
            await pool.query('DELETE FROM class_students WHERE class_id = $1', [id]);
            await pool.query('DELETE FROM attendance WHERE class_id = $1', [id]);
            // Xóa lớp học
            const result = await pool.query('DELETE FROM classes WHERE id = $1 RETURNING *', [id]);

            return result.rows[0];
        } catch (error) {
            console.error('Error in Class.delete:', error);
            throw error;
        }
    }

    static async findByClassCode(classCode) {
        try {
            const result = await pool.query('SELECT * FROM classes WHERE class_code = $1', [classCode]);
            return result.rows[0];
        } catch (error) {
            console.error('Error in Class.findByClassCode:', error);
            throw error;
        }
    }

    static async getClassesByTeacherId(teacherId, limit = 10, offset = 0) {
        try {
            const result = await pool.query(
                'SELECT * FROM classes WHERE teacher_id = $1 LIMIT $2 OFFSET $3',
                [teacherId, limit, offset]
            );
            return result.rows;
        } catch (error) {
            console.error('Error in Class.getClassesByTeacherId:', error);
            throw error;
        }
    }
    static async getAllClasses(limit = 10, offset = 0) {
        try {
          const result = await pool.query('SELECT * FROM classes LIMIT $1 OFFSET $2', [limit, offset]);
          return result.rows;
        } catch (error) {
          console.error('Error in Class.getAllClasses:', error);
          throw error;
        }
      }

    static async addStudentToClass(classId, userId) {
        try {
            const result = await pool.query(
                'INSERT INTO class_students (class_id, user_id) VALUES ($1, $2) RETURNING *',
                [classId, userId]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error in Class.addStudentToClass:', error);
            throw error;
        }
    }
    static async removeStudentFromClass(classId, userId) {
        try {
          const result = await pool.query(
            'DELETE FROM class_students WHERE class_id = $1 AND user_id = $2 RETURNING *',
            [classId, userId]
          );
          return result.rows[0]; // Có thể trả về số dòng bị ảnh hưởng (rows.affectedRows)
        } catch (error) {
          console.error('Error in Class.removeStudentFromClass:', error);
          throw error;
        }
      }

      static async getStudentsInClass(classId, limit = 1000, offset = 0) { // Tăng limit mặc định
        try {
            const result = await pool.query(
                `SELECT u.id, u.username, u.email, u.full_name, u.student_id, u.role
                 FROM users u
                 INNER JOIN class_students cs ON u.id = cs.user_id
                 WHERE cs.class_id = $1 AND u.is_deleted = FALSE
                 ORDER BY u.full_name
                 LIMIT $2 OFFSET $3`,
                [classId, limit, offset]
            );
            return result.rows;
        } catch (error) {
            console.error('Error in Class.getStudentsInClass:', error);
            throw error;
        }
    }
    static async getClassesByStudentId(studentId, limit = 100, offset = 0) {
        try {
            const result = await pool.query(
                `SELECT c.*
                 FROM classes c
                 INNER JOIN class_students cs ON c.id = cs.class_id
                 WHERE cs.user_id = $1
                 ORDER BY c.class_name
                 LIMIT $2 OFFSET $3`,
                [studentId, limit, offset]
            );
            return result.rows;
        } catch (error) {
            console.error('Error in Class.getClassesByStudentId:', error);
            throw error;
        }
    }
}

module.exports = Class;