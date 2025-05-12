// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const {promisify} = require('util');

const signAsync = promisify(jwt.sign);

exports.register = async (req, res) => {
    try
    {
        const {username, password, role, email, full_name} = req.body;
        // Validate input (sử dụng joi hoặc tương tự)
        // Kiểm tra xem username đã tồn tại chưa
         const existingUser = await User.findByUsername(username);
          if (existingUser) {
              return res.status(400).json({ message: 'Username đã tồn tại.' });
            }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới
        const newUser = await User.create({username, password: hashedPassword, role, email, full_name});
          // Tạo JWT token
         const token = await signAsync({ id: newUser.id, role: newUser.role }, config.jwtSecret, { expiresIn: '1h' });

        res.status(201).json({ message: 'Đăng ký thành công', token, user: { id: newUser.id, username: newUser.username, role: newUser.role } });

    }
    catch(error)
    {
        console.error(error);
        res.status(500).json({message:"Lỗi server"});
    }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // --- Logging chi tiết ---
    console.log(`[Auth Login] Received login attempt for username: "${username}"`); // Log username nhận được
    if (!username || !password) {
        console.log('[Auth Login] Failed: Missing username or password in request body.');
        // Trả lỗi nếu thiếu thông tin
        return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    }
    // --- Kết thúc Logging ---

    // Tìm user trong database (đã sửa ở model để không phân biệt hoa thường)
    const user = await User.findByUsername(username);

    // --- Logging chi tiết ---
    console.log(`[Auth Login] Database lookup result for username "${username}":`, user ? `User ID ${user.id} found.` : 'User not found.');
    // --- Kết thúc Logging ---

    if (!user) {
      // --- Logging chi tiết ---
      console.log(`[Auth Login] Failed: User "${username}" not found in database.`);
      // --- Kết thúc Logging ---
      // Giữ thông báo lỗi chung chung để bảo mật
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    // --- Logging chi tiết ---
    console.log(`[Auth Login] Comparing provided password with stored hash for user ID ${user.id}.`);
    // --- Kết thúc Logging ---

    // So sánh mật khẩu nhập vào với mật khẩu đã hash trong DB
    const isMatch = await bcrypt.compare(password, user.password);

    // --- Logging chi tiết ---
    console.log(`[Auth Login] Password comparison result for user ID ${user.id}: ${isMatch}`); // Rất quan trọng để xem kết quả so sánh
    // --- Kết thúc Logging ---

    if (!isMatch) {
      // --- Logging chi tiết ---
      console.log(`[Auth Login] Failed: Password mismatch for user ID ${user.id}.`);
      // --- Kết thúc Logging ---
       // Giữ thông báo lỗi chung chung để bảo mật
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    // Nếu mọi thứ đều đúng, tạo JWT
    console.log(`[Auth Login] Passwords match. Generating JWT for user ID ${user.id}, role ${user.role}.`);
    // Sử dụng jwt.sign trực tiếp vì đã require 'jsonwebtoken' ở trên
    const token = await jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: '1h' });

    console.log(`[Auth Login] Login successful for user "${username}" (ID: ${user.id}).`);
    // Trả về thông tin thành công
    res.json({ message: 'Đăng nhập thành công', token, user: { id: user.id, username: user.username, role: user.role } });

  } catch (error) {
    // Log bất kỳ lỗi không mong muốn nào xảy ra trong quá trình
    console.error('[Auth Login] Unexpected server error during login process:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};


// Hàm lấy thông tin profile user đang đăng nhập
exports.getProfile = async (req, res) => {
  try {
    // Thông tin user đã được middleware authMiddleware.protect lấy và gắn vào req.user
    const userProfile = req.user;
    // Không nên trả về mật khẩu
    const { password, ...userProfileWithoutPassword } = userProfile;
    res.json(userProfileWithoutPassword);
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Hàm cập nhật thông tin profile user đang đăng nhập
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    // Chỉ cho phép cập nhật một số trường nhất định từ req.body
    const { full_name, email, student_id } = req.body;
    const updateData = { full_name, email };

    // Nếu là student thì cho phép cập nhật student_id
    if (req.user.role === 'student') {
      updateData.student_id = student_id;
    }

    // Gọi hàm update từ User model (lưu ý: hàm User.update hiện tại chưa cho đổi role, username, password)
    const updatedUser = await User.update(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Không trả về mật khẩu
    const { password, ...updatedUserWithoutPassword } = updatedUser;
    res.json(updatedUserWithoutPassword);

  } catch (error) {
    console.error('Error in updateProfile:', error);
    // Xử lý lỗi trùng email nếu có
    if (error.code === '23505' && error.constraint === 'users_email_key') {
         return res.status(400).json({ message: 'Email already exists' });
    }
     if (error.code === '23505' && error.constraint === 'users_student_id_key') {
         return res.status(400).json({ message: 'Student ID already exists' });
    }
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// Hàm đổi mật khẩu user đang đăng nhập
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    // Cần kiểm tra newPassword có đủ mạnh không (ví dụ: > 8 ký tự) - có thể dùng express-validator

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Old password and new password are required.' });
    }

    // Gọi hàm changePassword từ User model
    await User.changePassword(userId, oldPassword, newPassword);

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Error in changePassword:', error);
    // Bắt lỗi cụ thể từ model (ví dụ: sai mật khẩu cũ)
    if (error.message === 'Incorrect password') {
        return res.status(400).json({ message: 'Incorrect old password.' });
    }
     if (error.message === 'User not found') {
         return res.status(404).json({ message: 'User not found.' });
     }
    res.status(500).json({ message: 'Server error changing password' });
  }
};