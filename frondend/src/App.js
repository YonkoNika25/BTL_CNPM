// src/frondend/src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Import hook useAuth

// Import các Pages cần thiết
import LoginPage from './pages/Login/Login';
import RegisterPage from './pages/Register/Register';
import DashboardPage from './pages/Dashboard/Dashboard';
import ClassesPage from './pages/Classes/Classes';
import ClassDetailPage from './pages/Classes/Classdetail'; // Đảm bảo tên file đúng
import ScanQRPage from './pages/ScanQR/ScanQRPage';          // Trang quét QR
import AttendanceHistoryPage from './pages/Attendance/AttendanceHistory'; // Trang lịch sử
import NotificationsPage from './pages/Notifications/Notifications';
import ProfilePage from './pages/Profile/Profile';
// Import trang quản lý user nếu bạn đã tạo
// import UserManagementPage from './pages/Admin/UserManagementPage';

function App() {
    // Lấy trạng thái đăng nhập, thông tin user và trạng thái loading từ context
    const { isAuthenticated, user, loading: authLoading } = useAuth();

    // Quan trọng: Hiển thị trạng thái loading trong khi chờ xác thực
    if (authLoading) {
         return <div>Loading Application...</div>; // Có thể thay bằng component Spinner
    }

    // Định nghĩa các Route (đường dẫn) cho ứng dụng
    return (
        <Routes>
            {/* --- Route công khai --- */}
            {/* Nếu đã đăng nhập thì chuyển đến dashboard, nếu chưa thì hiện trang Login/Register */}
            <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
            <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />

            {/* --- Route yêu cầu đăng nhập --- */}

            {/* Trang gốc (/) sẽ chuyển hướng tùy thuộc trạng thái đăng nhập */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />

            {/* Các trang yêu cầu đăng nhập chung cho mọi role */}
            <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />} />
            <Route path="/classes" element={isAuthenticated ? <ClassesPage /> : <Navigate to="/login" replace />} />
            <Route path="/classes/:classId" element={isAuthenticated ? <ClassDetailPage /> : <Navigate to="/login" replace />} />
            <Route path="/notifications" element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" replace />} />
            <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />} />

             {/* --- Route chỉ dành cho Sinh viên --- */}
             {/* Chỉ cho phép truy cập nếu đã đăng nhập VÀ là sinh viên */}
             <Route
                 path="/scan-qr"
                 element={isAuthenticated && user?.role === 'student'
                            ? <ScanQRPage />
                            : <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
                         }
             />
              <Route
                 path="/attendance/history"
                 element={isAuthenticated && user?.role === 'student'
                            ? <AttendanceHistoryPage />
                            : <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
                         }
             />

             {/* --- Route chỉ dành cho Giáo viên --- */}
             {/* Chỉ cho phép truy cập nếu đã đăng nhập VÀ là giáo viên */}

             {/* --- Route chỉ dành cho Admin --- */}
             {/* Chỉ cho phép truy cập nếu đã đăng nhập VÀ là admin */}
             {/* Ví dụ:
             <Route
                 path="/admin/users"
                 element={isAuthenticated && user?.role === 'admin'
                            ? <UserManagementPage />
                            : <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
                         }
             /> */}

            {/* Route bắt lỗi 404 (Not Found) */}
            {/* Nếu đã đăng nhập mà vào link sai -> 404, nếu chưa đăng nhập -> về login */}
            <Route path="*" element={isAuthenticated ? <div>404 Page Not Found</div> : <Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;