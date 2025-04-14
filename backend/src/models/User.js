// backend/src/models/User.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  static async findById(id) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in findByUsername:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { username, password, role, email, full_name, student_id } = userData;
      const result = await pool.query(
        'INSERT INTO users (username, password, role, email, full_name, student_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [username, password, role, email, full_name, student_id]
      );
      console.log(`[DB User Model] Created user "${username}" with hashed password.`); // Thêm log xác nhận
      return result.rows[0];
    } catch (error) {
      console.error('[DB User Model] Error in create user:', error);
      throw error;
    }
  }

  static async update(id, userData) {
    try {
      const { username, email, full_name, student_id, role } = userData;
      // Bạn có thể không cho phép cập nhật password ở đây, nên có hàm changePassword riêng
      const result = await pool.query(
        'UPDATE users SET username = $1, email = $2, full_name = $3, student_id = $4, role = $5 WHERE id = $6 RETURNING *',
        [username, email, full_name, student_id, role, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

    // Thay vì xóa hoàn toàn, thường sẽ là "soft delete" - đánh dấu là đã xóa
  static async delete(id) {
      try{
          const result = await pool.query('UPDATE users SET is_deleted = TRUE WHERE id = $1 RETURNING *', [id]); // Thêm cột is_deleted
          return result.rows[0];
      }
      catch(error)
      {
          console.error("Error in delete: ", error);
          throw error;
      }

  }
    // Đổi mật khẩu.  Cần cung cấp mật khẩu cũ để kiểm tra
  static async changePassword(id, oldPassword, newPassword) {
     try{
        const user = await this.findById(id);
        if (!user) {
        throw new Error('User not found'); // Có thể custom error
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch)
        {
            throw new Error("Incorrect password");
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
         const result = await pool.query('UPDATE users SET password = $1 WHERE id = $2 RETURNING *',
         [hashedNewPassword, id]
         );
         return result.rows[0];

     }
     catch(error){
        console.error('Error in changePassword:', error);
        throw error;
     }
  }

  static async getAllUsers(limit = 10, offset = 0) {
    try {
      const result = await pool.query('SELECT * FROM users LIMIT $1 OFFSET $2', [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  static async getStudents(limit = 10, offset = 0) {
    try {
      const result = await pool.query("SELECT * FROM users WHERE role = 'student' LIMIT $1 OFFSET $2", [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error in getStudents:', error);
      throw error;
    }
  }

  static async getTeachers(limit = 10, offset = 0) {
    try {
      const result = await pool.query("SELECT * FROM users WHERE role = 'teacher' LIMIT $1 OFFSET $2", [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error in getTeachers:', error);
      throw error;
    }
  }

  static async getUsersByRole(role, limit = 10, offset = 0) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE role = $1 LIMIT $2 OFFSET $3', [role, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error in getUsersByRole:', error);
      throw error;
    }
  }
}

module.exports = User;