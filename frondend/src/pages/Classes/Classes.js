// frontend/src/pages/Classes/Classes.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as classService from '../../services/classService';
import { Link } from 'react-router-dom';
import ClassList from '../../components/ClassList/ClassList';
import ClassForm from '../../components/ClassForm/ClassForm'; // Thêm để chuẩn bị cho nút Create
import EditClassForm from '../../components/EditClassForm/EditClassForm'; // Thêm để chuẩn bị cho nút Edit

function ClassesPage() {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                let fetchedClasses;
                if (user.role === 'teacher') {
                    fetchedClasses = await classService.getClassesByTeacherId(user.id);
                }
                else if(user.role === 'admin') {
                    fetchedClasses = await classService.getAllClasses();
                }
                else { //student
                    //Lấy danh sách lớp học sinh viên đó tham gia

                }
                setClasses(fetchedClasses);
            } catch (err) {
                setError(err.message || 'Failed to fetch classes');
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [user.id, user.role]);


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
                <button>Create Class</button> // Thêm component CreateClassForm
            )}

            {classes.length === 0 ? (
                <p>No classes found.</p>
            ) : (
                // Sử dụng Component ClassList thay vì tự render ul/li
                <ClassList
                    classes={classes}
                    // Tạm thời chưa truyền onEdit, onDelete vì logic phức tạp hơn
                    // onEdit={handleEditClick} // Sẽ thêm sau
                    // onDelete={handleDeleteClick} // Sẽ thêm sau
                />
            )}
        </div>
    );
}

export default ClassesPage;