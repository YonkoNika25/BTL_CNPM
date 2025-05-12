// backend/src/models/Notification.js

const pool = require('../config/db');

class Notification {
    static async findById(id) {
        try {
            const result = await pool.query('SELECT * FROM notifications WHERE id = $1', [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error in Notification.findById:', error);
            throw error;
        }
    }

    static async create(notificationData) {
        try {
            const { user_id, message, timestamp, is_read } = notificationData;
            const result = await pool.query(
                'INSERT INTO notifications (user_id, message, timestamp, is_read) VALUES ($1, $2, $3, $4) RETURNING *',
                [user_id, message, timestamp, is_read]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error in Notification.create:', error);
            throw error;
        }
    }
  static async markAsRead(id) {
    try {
      const result = await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Notification.markAsRead:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId) {
    try {
      const result = await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1 RETURNING *', [userId]);
      return result.rows; // Trả về tất cả các thông báo đã được cập nhật
    } catch (error) {
      console.error('Error in Notification.markAllAsRead:', error);
      throw error;
    }
  }

  static async getUnreadNotifications(userId, limit = 10, offset = 0) {
    try {
      const result = await pool.query(
        'SELECT * FROM notifications WHERE user_id = $1 AND is_read = FALSE ORDER BY timestamp DESC LIMIT $2 OFFSET $3',
        [userId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error('Error in Notification.getUnreadNotifications:', error);
      throw error;
    }
  }
    static async getAllNotifications(userId, limit = 10, offset =0)
    {
        try{
            const result = await pool.query(
                'SELECT * FROM notifications WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2 OFFSET $3',
                [userId, limit, offset]
            );
            return result.rows;
        }
        catch(error)
        {
            console.error("Error in Notification.getAllNotifications: ", error);
            throw error;
        }
    }
  static async delete(id) {
    try {
      const result = await pool.query('DELETE FROM notifications WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Notification.delete:', error);
      throw error;
    }
  }
}

module.exports = Notification;