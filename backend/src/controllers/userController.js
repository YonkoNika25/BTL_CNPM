// backend/src/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
    try {
        const { limit, offset } = req.query;
        const users = await User.getAllUsers(limit, offset);
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStudents = async (req, res) => {
    try {
        const { limit, offset } = req.query;
        const students = await User.getStudents(limit, offset);
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTeachers = async (req, res) => {
    try {
        const { limit, offset } = req.query;
        const teachers = await User.getTeachers(limit, offset);
        res.json(teachers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserById = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
        // Loại bỏ password trước khi trả về
        const {password, ...userData} = user;
      res.json(userData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  exports.createUser = async (req, res) => {
    try {
      const { username, password, role, email, full_name, student_id } = req.body;

      // Kiểm tra xem username hoặc email đã tồn tại chưa
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const userData = {
        username,
        password: hashedPassword, // Lưu mật khẩu đã hash
        role,
        email,
        full_name,
        student_id,
      };

      const newUser = await User.create(userData);

      // Không trả về password
      const { password: userPassword, ...newUserWithoutPassword } = newUser;

      res.status(201).json(newUserWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
exports.updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, full_name, student_id, role } = req.body;
      const userData = { username, email, full_name, student_id, role };
      const updatedUser = await User.update(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
       // Không trả về password
        const {password, ...updatedUserWithoutPassword} = updatedUser;

      res.json(updatedUserWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  exports.deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedUser = await User.delete(id);
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };