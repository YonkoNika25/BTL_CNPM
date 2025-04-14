// backend/src/controllers/classController.js

const Class = require('../models/Class');

exports.createClass = async (req, res) => {
  try {
    const { class_code, class_name } = req.body;
    const teacher_id = req.user.id; // Lấy từ middleware xác thực
    const classData = { class_code, class_name, teacher_id };
    const newClass = await Class.create(classData);
    res.status(201).json(newClass);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const classObj = await Class.findById(id);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(classObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_code, class_name, teacher_id } = req.body; //Có thể bỏ teacher_id
    const classData = { class_code, class_name, teacher_id };
    const updatedClass = await Class.update(id, classData);
    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(updatedClass);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClass = await Class.delete(id);
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllClasses = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const classes = await Class.getAllClasses(limit, offset);
    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getClassesByTeacherId = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { limit, offset } = req.query;
    const classes = await Class.getClassesByTeacherId(teacherId, limit, offset);
    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addStudentToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { userId } = req.body; // Hoặc có thể lấy từ params nếu muốn
    const result = await Class.addStudentToClass(classId, userId);
    res.status(201).json(result); // Hoặc trả về message
  } catch (error) {
    console.error(error);
    if (error.code === '23505') { // Mã lỗi PostgreSQL cho unique violation (constraint vi phạm)
      return res.status(400).json({ message: 'Sinh viên đã có trong lớp học' });
    }
    if (error.code === '23503') { // foreign_key_violation
      return res.status(400).json({ message: 'Lớp học hoặc sinh viên không tồn tại.' })
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeStudentFromClass = async (req, res) => {
  try {
    const { classId, userId } = req.params;
    const result = await Class.removeStudentFromClass(classId, userId);

    if (result) {  // Kiểm tra xem có dòng nào bị ảnh hưởng không
      res.json({ message: 'Student removed from class successfully' });
    } else {
      res.status(404).json({ message: 'Student or class not found in the relationship' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudentsInClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { limit, offset } = req.query;
    const students = await Class.getStudentsInClass(classId, limit, offset);
    res.json(students);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
