-- Bảng lưu thông tin người dùng (sinh viên, giáo viên, admin)
CREATE TABLE users (
    id SERIAL PRIMARY KEY, -- ID tự tăng, khóa chính
    username VARCHAR(255) UNIQUE NOT NULL, -- Tên đăng nhập, không trùng, bắt buộc
    password VARCHAR(255) NOT NULL, -- Mật khẩu đã mã hóa, bắt buộc
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')), -- Vai trò, bắt buộc, chỉ nhận 1 trong 3 giá trị
    email VARCHAR(255) UNIQUE NOT NULL, -- Email, không trùng, bắt buộc
    full_name VARCHAR(255), -- Họ tên đầy đủ
    student_id VARCHAR(100) UNIQUE, -- Mã số sinh viên, không trùng (nếu có)
    is_deleted BOOLEAN DEFAULT FALSE, -- Đánh dấu đã xóa (mặc định là chưa xóa)
    fcm_token TEXT, -- Token để gửi thông báo đẩy (Firebase)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- Thời gian tạo (tự động)
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP -- Thời gian cập nhật (sẽ cần trigger để tự động cập nhật)
);

-- Bảng lưu thông tin lớp học
CREATE TABLE classes (
    id SERIAL PRIMARY KEY, -- ID lớp học tự tăng
    class_code VARCHAR(100) UNIQUE NOT NULL, -- Mã lớp học, không trùng, bắt buộc
    class_name VARCHAR(255) NOT NULL, -- Tên lớp học, bắt buộc
    teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- ID giáo viên phụ trách, liên kết với bảng users. Nếu giáo viên bị xóa, cột này thành NULL.
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bảng trung gian lưu quan hệ Sinh viên - Lớp học (Nhiều-Nhiều)
CREATE TABLE class_students (
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE, -- Liên kết đến bảng classes. Nếu lớp bị xóa, dòng này bị xóa.
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Liên kết đến bảng users. Nếu user bị xóa, dòng này bị xóa.
    PRIMARY KEY (class_id, user_id), -- Khóa chính kết hợp, đảm bảo 1 sinh viên chỉ tham gia 1 lớp 1 lần.
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP -- Thời gian tham gia lớp
);

-- Bảng lưu lịch sử điểm danh
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY, -- ID điểm danh tự tăng
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- ID người được điểm danh
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE, -- ID lớp học được điểm danh
    attendance_type VARCHAR(50) NOT NULL, -- Kiểu điểm danh (ví dụ: 'manual', 'QR', 'quiz')
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- Thời gian điểm danh
    quiz_answer_id INTEGER, -- ID câu trả lời quiz (nếu điểm danh bằng quiz)
    status VARCHAR(50) -- Trạng thái điểm danh (ví dụ: 'present', 'absent', 'late') - Cần bổ sung logic nếu dùng
);

-- Bảng lưu thông báo
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY, -- ID thông báo tự tăng
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- ID người nhận thông báo
    message TEXT NOT NULL, -- Nội dung thông báo
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- Thời gian tạo thông báo
    is_read BOOLEAN DEFAULT FALSE -- Đánh dấu đã đọc hay chưa
);

-- (Tùy chọn) Trigger để tự động cập nhật updated_at khi bản ghi thay đổi
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Thêm trigger tương tự cho các bảng khác nếu cần theo dõi thời gian cập nhật