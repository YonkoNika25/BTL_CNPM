// src/frondend/src/pages/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as classService from '../../services/classService';
import ClassList from '../../components/ClassList/ClassList'; // Component hiển thị danh sách lớp
import styles from './Dashboard.module.css'; // Import CSS
import { Link } from 'react-router-dom'; // Import Link để điều hướng

function DashboardPage() {
    // Lấy thông tin user, hàm logout và trạng thái loading từ AuthContext
    const { user, logout, loading: authLoading } = useAuth();
    // State để lưu danh sách lớp học (cho GV/Admin)
    const [classes, setClasses] = useState([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [errorClasses, setErrorClasses] = useState(null);

    // useEffect để fetch danh sách lớp khi user thay đổi (và user không phải là student)
    useEffect(() => {
        if (user && user.id && user.role !== 'student') {
            const fetchClasses = async () => {
                setLoadingClasses(true);
                setErrorClasses(null);
                try {
                    let fetchedClasses = [];
                    if (user.role === 'teacher') {
                        // Lấy 5 lớp gần nhất của GV
                        fetchedClasses = await classService.getClassesByTeacherId(user.id, 5, 0);
                    } else if (user.role === 'admin') {
                        // Lấy 5 lớp bất kỳ (ví dụ)
                        fetchedClasses = await classService.getAllClasses(5, 0);
                    }
                    setClasses(fetchedClasses || []); // Đảm bảo classes luôn là mảng
                } catch (error) {
                    console.error("Failed to fetch classes:", error);
                    setErrorClasses(error.message || 'Failed to load classes');
                } finally {
                    setLoadingClasses(false);
                }
            };
            fetchClasses();
        } else {
            setClasses([]); // Reset nếu là student hoặc không có user
        }
    }, [user]); // Chạy lại khi user thay đổi

    // Hiển thị loading nếu AuthContext đang load hoặc chưa có user
    if (authLoading || !user) {
        return <div className={styles.loading}>Loading user data...</div>;
    }

    // Render giao diện Dashboard
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Dashboard</h1>

            {/* Khu vực thông tin người dùng */}
            <div className={styles.userInfo}>
                <p><strong>Welcome, {user.full_name || user.username}!</strong></p>
                <p><strong>Role:</strong> {user.role}</p>
                {user.role === 'student' && (
                    <p><strong>Student ID:</strong> {user.student_id || 'N/A'}</p>
                )}
            </div>

            {/* --- Phần chức năng cho Sinh viên --- */}
            {user.role === 'student' && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Student Menu</h2>
                    {/* Link đến trang quét QR */}
                    <Link to="/scan-qr" className={styles.link}>Scan Attendance QR</Link>
                    {/* Link đến trang lịch sử điểm danh */}
                    <Link to="/attendance/history" className={styles.link}>View Attendance History</Link>
                    {/* Có thể thêm link xem thông báo */}
                    <Link to="/notifications" className={`${styles.link} ${styles.notificationLink}`}>View Notifications</Link>
                </div>
            )}

            {/* --- Phần chức năng cho Giảng viên / Admin --- */}
            {(user.role === 'teacher' || user.role === 'admin') && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Recent Classes / Management</h2>
                    {loadingClasses && <p>Loading classes...</p>}
                    {errorClasses && <p className={styles.error}>{errorClasses}</p>}
                    {!loadingClasses && !errorClasses && (
                        <>
                            {classes.length === 0 ? (
                                <p>No classes found.</p>
                            ) : (
                                // Component hiển thị danh sách lớp học
                                <ClassList classes={classes} />
                            )}
                             {/* Link đến trang quản lý tất cả lớp học */}
                            <Link to="/classes" className={`${styles.link} ${styles.viewAllLink}`}>View/Manage All Classes</Link>
                        </>
                    )}
                </div>
            )}

            {/* --- Phần chỉ dành cho Admin --- */}
            {( user.role === 'admin') && (
                 <div className={styles.section}>
                      <h2 className={styles.sectionTitle}>Admin Tools</h2>
                      {/* Link đến trang quản lý người dùng (nếu có) */}
                      {/* <Link to="/admin/users" className={`${styles.link} ${styles.adminLink}`}>Manage Users</Link> */}
                      {/* Thêm các link quản trị khác */}
                 </div>
            )}

             {/* --- Khu vực Hành động chung --- */}
             <div className={styles.commonActions}>
                 <Link to="/profile" className={`${styles.link} ${styles.profileLink}`}>My Profile</Link>
                 {/* Nút Logout */}
                 <button onClick={logout} className={styles.logoutButton}>Logout</button>
            </div>
        </div>
    );
}

export default DashboardPage;