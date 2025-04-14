// src/frondend/src/pages/Classes/Classdetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as classService from '../../services/classService';
import * as userService from '../../services/userService';
import * as attendanceService from '../../services/attendanceService';
import styles from './ClassDetail.module.css'; // Đảm bảo import CSS
import StudentList from '../../components/StudentList/StudentList';
import AddStudentToClassForm from '../../components/AddStudentToClassForm/AddStudentToClassForm';
import EditClassForm from '../../components/EditClassForm/EditClassForm';
import AttendanceForm from '../../components/AttendanceForm/AttendanceForm';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from "qrcode.react";
function ClassDetailPage() {
    const { classId } = useParams();
    const [classInfo, setClassInfo] = useState(null);
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    // State cho chức năng QR Code
    const [qrCodeData, setQrCodeData] = useState(null); // Lưu trữ { qrData: string, expiresAt: string }
    const [qrError, setQrError] = useState('');
    const [qrLoading, setQrLoading] = useState(false);

    // Hàm fetch dữ liệu lớp học và giáo viên
    const fetchClassData = async () => {
        setLoading(true);
        setError(null);
        setQrCodeData(null);
        setQrError('');
        try {
            const classData = await classService.getClassById(classId);
            if (!classData) throw new Error('Class not found.');
            setClassInfo(classData);
            if (classData.teacher_id) {
                const teacherData = await userService.getUserById(classData.teacher_id);
                setTeacher(teacherData);
            } else { setTeacher(null); }
        } catch (err) {
            setError(err.message || 'Failed to fetch class details');
            setClassInfo(null);
            setTeacher(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchClassData(); }, [classId]);

    // Xử lý xóa lớp học
    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            try {
                await classService.deleteClass(classId);
                navigate('/classes');
            } catch (err) { setError(err.message || 'Failed to delete class'); }
        }
    };

    // Xử lý sau khi sửa lớp thành công
    const handleEditClassSuccess = () => {
        setEditing(false);
        alert('Class updated successfully!');
        fetchClassData(); // Load lại dữ liệu lớp
    };

     // Callback để biết cần cập nhật lại danh sách sinh viên
    const handleStudentListUpdate = () => {
       console.log("Student list possibly updated.");
       // Có thể fetch lại StudentList hoặc fetchClassData()
    }

    // Xử lý tạo QR Code
    const handleGenerateQR = async () => {
        setQrLoading(true);
        setQrError('');
        setQrCodeData(null);
        try {
            const duration = 5;
            const response = await attendanceService.generateQRCodeData(classId, duration);
            setQrCodeData(response);
        } catch (err) {
             setQrError(err.message || 'Failed to generate QR code');
        } finally {
            setQrLoading(false);
        }
    };

    // --- Render Loading/Error/Not Found ---
    if (loading) return <div className={styles.container}>Loading class details...</div>;
    if (error) return <div className={`${styles.container} ${styles.error}`}>Error: {error}</div>;
    if (!classInfo) return <div className={styles.container}>Class not found.</div>;

    // Xác định quyền
    const isClassTeacher = user && user.role === 'teacher' && user.id === classInfo.teacher_id;
    const isAdmin = user && user.role === 'admin';
    const canManageClass = isAdmin || isClassTeacher; // Admin hoặc GV của lớp có thể quản lý

    return (
        <div className={styles.container}>
            {/* --- Chế độ Sửa thông tin lớp --- */}
            {editing ? (
                <EditClassForm
                    classInfo={classInfo}
                    onSuccess={handleEditClassSuccess}
                    onCancel={() => setEditing(false)}
                />
            ) : (
                 // --- Chế độ Xem thông tin lớp ---
                <>
                    <h1 className={styles.title}>{classInfo.class_name} ({classInfo.class_code})</h1>
                    <p className={styles.teacherInfo}>Teacher: {teacher ? `${teacher.full_name} (${teacher.username})` : 'N/A'}</p>

                    {/* --- Nút chức năng quản lý lớp --- */}
                    {canManageClass && (
                        <div className={styles.buttonContainer}>
                            <button className={styles.editButton} onClick={() => setEditing(true)}>Edit Class Info</button>
                            <button className={styles.deleteButton} onClick={handleDelete}>Delete Class</button>
                        </div>
                    )}

                    {/* --- Phần dành cho Sinh viên xem --- */}
                     {user?.role === 'student' && (
                        <div className={styles.studentActions}>
                             <h3>Student Actions</h3>
                             <Link to={`/scan-qr`} className={styles.link}>Scan Attendance QR</Link>
                             <Link to="/attendance/history" className={styles.link}>View My Attendance</Link>
                        </div>
                     )}

                    {/* --- Phần dành cho GV/Admin xem và quản lý --- */}
                    {canManageClass && (
                        <>
                             <hr className={styles.separator} />
                             <h2>Student Management</h2>
                             <StudentList classId={classId} />
                             <AddStudentToClassForm classId={classId} onSuccess={handleStudentListUpdate} />

                             <hr className={styles.separator} />
                             <h2>Attendance Tools</h2>

                             {/* --- Tạo QR Code (Chỉ GV của lớp) --- */}
                             {isClassTeacher && (
                                 <div className={styles.qrSection}>
                                     <h3>Generate Attendance QR Code</h3>
                                     <button onClick={handleGenerateQR} disabled={qrLoading} className={styles.qrButton}>
                                         {qrLoading ? 'Generating...' : 'Generate QR (5 min)'}
                                     </button>
                                     {qrError && <p className={styles.error}>{qrError}</p>}
                                     {qrCodeData && qrCodeData.qrData && (
                                         <div className={styles.qrDisplay}>
                                             <QRCodeSVG value={qrCodeData.qrData} size={200} level={"H"} includeMargin={true}/>
                                             <p>Expires at: {new Date(qrCodeData.expiresAt).toLocaleString()}</p>
                                             <p className={styles.qrInstruction}>Students: Use the "Scan QR Code" feature.</p>
                                         </div>
                                     )}
                                 </div>
                             )}

                              {/* --- Điểm danh thủ công --- */}
                              <div className={styles.manualAttendanceSection}>
                                  <h3>Manual Attendance Entry</h3>
                                  <AttendanceForm classId={classId} />
                              </div>

                              {/* --- Các chức năng khác (xem điểm danh, thông báo) sẽ thêm code sau --- */}
                              {/* <div><h3>View Daily Attendance</h3> ... </div> */}
                              {/* <div><h3>Send Notification</h3> ... </div> */}
                        </>
                    )}
                </>
            )}
        </div>
    );
}
export default ClassDetailPage;