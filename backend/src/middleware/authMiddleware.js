// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }
    req.user = user; // Gắn thông tin user vào request
    next(); // Cho phép đi tiếp
  } catch (error) {
    console.error(error);
     if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token đã hết hạn.' });
     }
    return res.status(401).json({ message: 'Token không hợp lệ.' });
  }
};