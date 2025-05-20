import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as classService from '../../services/classService';
import ClassList from '../../components/ClassList/ClassList';
import ClassForm from '../../components/ClassForm/ClassForm'; // Import form tạo lớp học

function ClassesPage() {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false); // Quản lý trạng thái hiển thị form

    // Hàm fetch danh sách lớp học
    const fetchClasses = async () => {
        setLoading(true);
        setError(null);
        try {
            let fetchedClasses = [];
            if (user.role === 'teacher') {
                fetchedClasses = await classService.getClassesByTeacherId(user.id);
            } else if (user.role === 'admin') {
                fetchedClasses = await classService.getAllClasses();
            } else {
                fetchedClasses = []; // Sinh viên không cần hiển thị danh sách lớp
            }
            setClasses(fetchedClasses);
        } catch (err) {
            setError(err.message || 'Failed to fetch classes');
        } finally {
            setLoading(false);
        }
    };

    // Gọi fetchClasses khi component được render
    useEffect(() => {
        fetchClasses();
    }, [user.id, user.role]);

    // Xử lý khi tạo lớp học thành công
    const handleCreateSuccess = () => {
        setShowCreateForm(false); // Ẩn form sau khi tạo thành công
        fetchClasses(); // Fetch lại danh sách lớp học
    };

    if (loading) {
        return <div>Loading classes...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Classes</h1>
            {(user.role === 'teacher' || user.role === 'admin') && (
                <>
                    <button onClick={() => setShowCreateForm(true)}>Create Class</button>
                    {showCreateForm && (
                        <ClassForm
                            onSuccess={handleCreateSuccess}
                            onCancel={() => setShowCreateForm(false)} // Đóng form khi nhấn Cancel
                        />
                    )}
                </>
            )}
            {classes.length === 0 ? (
                <p>No classes found.</p>
            ) : (
                <ClassList classes={classes} />
            )}
        </div>
    );
}

export default ClassesPage;