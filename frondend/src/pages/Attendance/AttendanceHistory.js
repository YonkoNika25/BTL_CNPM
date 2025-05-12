// src/frondend/src/pages/Attendance/AttendanceHistory.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as attendanceService from '../../services/attendanceService';
import styles from './AttendanceHistory.module.css';

function AttendanceHistoryPage() {
    const { user, loading: authLoading } = useAuth();
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!authLoading && user && user.id) {
            const fetchHistory = async () => {
                setLoading(true);
                setError(null);
                try {
                    const historyData = await attendanceService.getAttendanceHistory();
                    setAttendanceHistory(historyData || []);
                } catch (err) {
                    setError(err.message || 'Failed to load attendance history');
                } finally {
                    setLoading(false);
                }
            };
            fetchHistory();
        } else if (!authLoading && !user) {
             setLoading(false);
             setError("Please log in to view your attendance history.");
        }
    }, [user, authLoading]);

    if (authLoading || loading) {
        return <div className={styles.container}><p>Loading attendance history...</p></div>;
    }

    if (error) {
        return <div className={`${styles.container} ${styles.error}`}>Error: {error}</div>;
    }

    // Format lại trạng thái điểm danh
    const formatAttendanceType = (type) => {
        switch (type?.toLowerCase()) { // Thêm ?.toLowerCase() để an toàn hơn
            case 'qr':
            case 'manual':
            case 'present':
                return 'Present';
            case 'absent':
                return 'Absent';
            case 'permitted_absence':
                return 'Permitted Absence';
            default:
                return type || 'Unknown';
        }
    };

     // Lấy class CSS dựa trên trạng thái
     const getStatusClass = (type) => {
         switch (type?.toLowerCase()) {
             case 'qr':
             case 'manual':
             case 'present':
                 return styles.present;
             case 'absent':
                 return styles.absent;
             case 'permitted_absence':
                 return styles.permitted;
             default:
                 return styles.unknown;
         }
     }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>My Attendance History</h1>
            {attendanceHistory.length === 0 ? (
                <p>No attendance records found.</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Class Code</th>
                            <th>Class Name</th>
                            <th>Status</th>
                            <th>Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceHistory.map((record) => (
                            <tr key={record.id}>
                                <td>{new Date(record.timestamp).toLocaleDateString()}</td>
                                <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
                                <td>{record.class_code || 'N/A'}</td>
                                <td>{record.class_name || 'N/A'}</td>
                                <td>
                                    {/* Áp dụng class CSS */}
                                    <span className={`${styles.status} ${getStatusClass(record.attendance_type)}`}>
                                        {formatAttendanceType(record.attendance_type)}
                                    </span>
                                </td>
                                {/* Hiển thị rõ phương thức điểm danh gốc */}
                                <td>{record.attendance_type === 'QR' ? 'QR Scan' : record.attendance_type === 'manual' ? 'Manual' : record.attendance_type}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AttendanceHistoryPage;