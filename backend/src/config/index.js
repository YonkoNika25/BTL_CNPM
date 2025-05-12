// backend/src/config/index.js
require('dotenv').config(); // Tải biến môi trường từ file .env

module.exports = {
  jwtSecret: process.env.JWT_SECRET
  // Thêm các cấu hình khác nếu cần lấy từ process.env, ví dụ:
  // port: process.env.PORT || 3001,
};