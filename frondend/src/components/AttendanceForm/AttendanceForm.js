// frontend/src/components/AttendanceForm/AttendanceForm.js
import React, { useState } from 'react';
import * as attendanceService from '../../services/attendanceService';
import styles from './AttendanceForm.module.css';

function AttendanceForm({ classId }) {
    const [userId, setUserId] = useState('');
    const [attendanceType, setAttendanceType] = useState('manual'); // Mặc định
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        try {
            const attendanceData = {
                userId: userId, // Hoặc lấy từ form, hoặc dropdown chọn user
                class_id: classId,
                attendance_type: attendanceType,
                timestamp: new Date().toISOString(), // Hoặc lấy từ form (nếu cần)
                // quiz_answer_id: ... (nếu có)
            };


            await attendanceService.createAttendance(attendanceData);
            setSuccess('Attendance recorded successfully!');
            setUserId('');
            // Có thể reset form, hoặc cập nhật UI (ví dụ: thêm vào danh sách điểm danh)

        } catch (error) {
            //setError(error); // Hiển thị lỗi từ service
            setError(error.message || 'Failed to record attendance');
        }
    };

    return (
        <div className={styles.container}>
            <h3>Manual Attendance</h3>
            {success && <p className={styles.success}>{success}</p>}
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="userId">User ID (or Username):</label>
                    <input
                        type="text"
                        id="userId"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>
                <div>
                    <label htmlFor="attendanceType">Attendance Type:</label>
                    <select
                        id="attendanceType"
                        value={attendanceType}
                        onChange={(e) => setAttendanceType(e.target.value)}
                        className={styles.select}
                    >
                        <option value="manual">Manual</option>
                        <option value="QR">QR Code</option> {/* Nếu có điểm danh bằng QR ở đây */}
                        {/* <option value="quiz">Quiz</option>  Nếu có */}
                    </select>
                </div>
                <button type="submit" className={styles.button}>Record Attendance</button>
            </form>
        </div>
    );
}

export default AttendanceForm;